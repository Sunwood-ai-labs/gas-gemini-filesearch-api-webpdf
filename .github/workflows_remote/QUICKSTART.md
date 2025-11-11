# ⚡ クイックスタートガイド

5分で始めるリモートワークフロー！サクッと導入しちゃおう〜✨

## 🎯 3ステップで導入完了

### Step 1: ワークフローファイルをコピー（1分）

お好みのワークフローをコピー：

```bash
cd YOUR_REPOSITORY

# PR Review（Kozaki）を導入する場合
curl -o .github/workflows/pr-review-kozaki.yml \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/workflows_remote/pr-review-kozaki-remote.yml

# または他のレビュワー
# Yukimura: pr-review-yukimura-remote.yml
# Onizuka: pr-review-onizuka-remote.yml
```

### Step 2: シークレットを設定（2分）

GitHub リポジトリで設定：

```
Settings → Secrets and variables → Actions
→ New repository secret をクリック
```

**必須:**
- Name: `GH_PAT_KOZAKI` (レビュワー名に応じて変更)
- Value: あなたの GitHub Personal Access Token

- Name: `GEMINI_API_KEY`
- Value: あなたの Gemini API Key

### Step 3: ペルソナファイルを配置（2分）

```bash
mkdir -p .github/prompts

# ペルソナプロンプトをダウンロード
curl -o .github/prompts/reviewer-kozaki.md \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/prompts/reviewer-kozaki.md

# 必要に応じてカスタマイズ
vim .github/prompts/reviewer-kozaki.md
```

## ✅ 動作確認

PRを作成して確認：

```bash
git checkout -b test-remote-workflow
echo "# Test" >> README.md
git add .
git commit -m "Test remote workflow"
git push origin test-remote-workflow

# GitHub上でPRを作成
# → Kozakiがレビューコメントを投稿するのを確認！
```

## 🎨 カスタマイズ（オプション）

### バージョンを固定したい

ワークフローファイルの `env` セクションを編集：

```yaml
env:
  REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
  REMOTE_BRANCH: 'v1.0.0'  # ← ここを変更
```

### レビュワー名を変更したい

```yaml
env:
  REVIEWER_DISPLAY: '🦊 あなたのレビュワー名'  # ← 表示名
  REVIEWER_SIGNATURE: 'あなたのレビュワー名'   # ← 署名
```

## 🐛 トラブルシューティング

### スクリプトがダウンロードできない

**確認項目:**
```bash
# URLが正しいか確認
curl -I https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/scripts/build_reviewer_prompt.py

# 200 OK が返ってくればOK
```

### レビューが投稿されない

**確認項目:**
1. シークレットが正しく設定されているか
2. ペルソナファイルが存在するか
3. ワークフローログでエラーを確認

```bash
# Actions タブでログを確認
GitHub → Actions → 失敗したワークフロー → ログを確認
```

## 📚 さらに詳しく知りたい

- [完全ガイド](./GUIDE.md) - 詳細な説明
- [使い方](./README.md) - 基本的な使い方
- [テンプレート](./TEMPLATE.md) - カスタマイズパターン
- [比較](./COMPARISON.md) - ローカル版との違い

## 💡 次のステップ

### 他のワークフローも試してみる

```bash
# Yukimuraレビュワーも追加
curl -o .github/workflows/pr-review-yukimura.yml \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/workflows_remote/pr-review-yukimura-remote.yml

# ペルソナも追加
curl -o .github/prompts/reviewer-yukimura.md \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/prompts/reviewer-yukimura.md
```

### 他のリポジトリにも展開

```bash
# 同じ手順で他のリポジトリにもコピー
# スクリプトは自動取得されるので、ワークフローファイルだけでOK！
```

## 🎉 完成！

これで複数のリポジトリで同じワークフローを使えるようになったよ〜！

**メリット:**
- ✅ スクリプトは中央で一元管理
- ✅ 更新は1箇所でOK
- ✅ メンテナンス超楽！

---

**よき〜！かわいくて強いワークフローの完成だね💕**

## 📞 サポート

問題があれば Issue を開いてね！
- [Issue を開く](https://github.com/Sunwood-ai-labsII/gemini-actions-lab/issues)

---

**Let's automate with style! 🚀✨**
