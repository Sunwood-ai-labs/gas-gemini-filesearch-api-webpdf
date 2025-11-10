/**
 * Gemini File Search: Web PDF → ストア投入 → 根拠付きで質問
 * - 404 対策: storeName / operationName は URL パスにそのまま埋め込む（/ をエンコードしない）
 * - APIキーは Script Properties もしくは Secret Manager から取得
 *
 * 使い方（どちらか一方）:
 *  A) Script Properties:
 *     エディタ右上「プロジェクト設定」→「スクリプト プロパティ」に
 *     GEMINI_API_KEY=（AI Studioのキー）を登録
 *     → CONFIG.USE_SECRET_MANAGER=false のまま実行
 *
 *  B) Secret Manager:
 *     - GASをGCPプロジェクトに関連付け
 *     - Secret Manager API有効化
 *     - "GEMINI_API_KEY" というシークレットを作成
 *     - 実行ユーザーに「Secret Manager Secret Accessor」権限
 *     → CONFIG.USE_SECRET_MANAGER=true と PROJECT_ID を設定
 */

// ====== 設定 ======
const CONFIG = {
  MODEL: 'models/gemini-2.5-flash',
  PDF_URL: 'https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/be80930d-51d1-4084-aa3e-b80930646538/5f5881e1/20251014_policies_shussan-kosodate_84.pdf',
  USE_SECRET_MANAGER: false,           // Secret Manager を使うなら true
  PROJECT_ID: 'YOUR_GCP_PROJECT_ID',   // USE_SECRET_MANAGER=true のとき必須
  STORE_DISPLAY_NAME: 'web-import-store',
  OPERATION_POLL_MAX: 60,              // *5秒 = 最大約5分
  OPERATION_POLL_INTERVAL_MS: 5000,
};

// ====== エントリーポイント ======
function main() {
  const apiKey = getGeminiApiKey_();
  Logger.log('Start. model=' + CONFIG.MODEL);

  // 1) File Search ストア作成
  const store = createFileSearchStore_(apiKey, CONFIG.STORE_DISPLAY_NAME);
  Logger.log('Store created: ' + store.name); // 例: fileSearchStores/xxxx

  // 2) WebのPDFを取得
  const pdfResp = UrlFetchApp.fetch(CONFIG.PDF_URL);
  if (pdfResp.getResponseCode() !== 200) {
    throw new Error('PDF取得に失敗: ' + pdfResp.getResponseCode());
  }
  const bytes = pdfResp.getContent();
  const contentType = pdfResp.getHeaders()['Content-Type'] || 'application/pdf';

  // 3) ストアへアップロード（非同期 Operation）
  const op = uploadToFileSearchStore_(apiKey, store.name, bytes, contentType);
  Logger.log('Upload operation: ' + op.name); // 例: operations/...

  // 4) インデックス完了待ち
  waitOperationDone_(apiKey, op.name);
  Logger.log('Indexing finished.');

  // 5) File Search を有効にして質問
  const prompt = 'この資料の要点を日本語で5つに要約し、各ポイントの根拠となる該当箇所の短い引用も付けてください。';
  const answer = askWithFileSearch_(apiKey, store.name, prompt);

  // 6) 結果ログ出力
  Logger.log(JSON.stringify(answer, null, 2));
  Logger.log('Done.');
}

// ====== 認証（APIキー取得） ======
function getGeminiApiKey_() {
  if (CONFIG.USE_SECRET_MANAGER) {
    return getGeminiApiKeyFromSecretManager_();
  }
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY が Script Properties に設定されていません。');
  return key.trim();
}

function getGeminiApiKeyFromSecretManager_() {
  if (!CONFIG.PROJECT_ID || CONFIG.PROJECT_ID === 'YOUR_GCP_PROJECT_ID') {
    throw new Error('CONFIG.PROJECT_ID をあなたのGCPプロジェクトIDに設定してください。');
  }
  const url = `https://secretmanager.googleapis.com/v1/projects/${CONFIG.PROJECT_ID}/secrets/GEMINI_API_KEY/versions/latest:access`;
  const token = ScriptApp.getOAuthToken();
  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: `Bearer ${token}` },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Secret Manager から取得失敗: ' + res.getContentText());
  }
  const payload = JSON.parse(res.getContentText());
  const decoded = Utilities.newBlob(Utilities.base64Decode(payload.payload.data)).getDataAsString();
  return decoded.trim();
}

// ====== File Search: ストア作成 ======
function createFileSearchStore_(apiKey, displayName) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=' + encodeURIComponent(apiKey);
  const payload = { displayName: displayName };
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code >= 200 && code < 300) return JSON.parse(body);
  throw new Error(`createFileSearchStore failed: ${code} ${body}`);
}

// ====== File Search: アップロード（/upload ...:uploadToFileSearchStore?uploadType=media） ======
function uploadToFileSearchStore_(apiKey, storeName, bytes, contentType) {
  const base = 'https://generativelanguage.googleapis.com/upload/v1beta/';
  // ★重要★ storeName は "fileSearchStores/xxxx" をそのままパスに入れる（/ をエンコードしない）
  const path = `${storeName}:uploadToFileSearchStore`;
  const url = `${base}${path}?uploadType=media&key=${encodeURIComponent(apiKey)}`;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: contentType || 'application/pdf',
    payload: bytes,
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code >= 200 && code < 300) return JSON.parse(body); // 長時間実行 Operation が返る
  throw new Error(`uploadToFileSearchStore failed: ${code} ${body}`);
}

// ====== 長時間実行 Operation 完了待ち ======
function waitOperationDone_(apiKey, operationName) {
  const base = 'https://generativelanguage.googleapis.com/v1beta/';
  // ★重要★ operationName も "operations/..." をそのままパスに入れる（/ をエンコードしない）
  for (let i = 0; i < CONFIG.OPERATION_POLL_MAX; i++) {
    const url = `${base}${operationName}?key=${encodeURIComponent(apiKey)}`;
    const res = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    const code = res.getResponseCode();
    const body = res.getContentText();

    if (code >= 200 && code < 300) {
      const op = JSON.parse(body);
      if (op.done) {
        if (op.error) throw new Error('Operation error: ' + JSON.stringify(op.error));
        return;
      }
    } else {
      throw new Error(`operations.get failed: ${code} ${body}`);
    }
    safeSleep(CONFIG.OPERATION_POLL_INTERVAL_MS);
  }
  throw new Error('Operation timeout: インデックス化が制限時間内に完了しませんでした。');
}

// ====== ユーティリティ ======
function safeSleep(ms) {
  if (typeof ms === 'number' && isFinite(ms) && ms >= 0) {
    Utilities.sleep(Math.floor(ms));
  }
}

// ====== 生成: File Search を有効にして質問 ======
function askWithFileSearch_(apiKey, storeName, userText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${CONFIG.MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    contents: [{ role: 'user', parts: [{ text: userText }]}],
    // ✅ ストアの指定は tools[].fileSearch の中に入れる
    tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }],
    // （必要なら）toolConfig は retrieval 設定などに使うが、今回は不要
    // 必要に応じて safetySettings / generationConfig を追加
  };
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code >= 200 && code < 300) return JSON.parse(body);
  throw new Error(`generateContent failed: ${code} ${body}`);
}
