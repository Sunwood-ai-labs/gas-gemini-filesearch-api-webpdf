# 🌟 リモートワークフロー導入ガイド

## 📖 概要

このドキュメントでは、`.github/workflows_remote/` フォルダに含まれるリモート実行型ワークフローについて説明するよ〜✨

## 🎯 解決する問題

### Before（従来の方式）😭

```
Repository A
├── .github/
│   ├── workflows/
│   │   └── pr-review.yml  ← ワークフロー
│   └── scripts/
│       └── build_reviewer_prompt.py  ← スクリプトもコピー必要
│
Repository B
├── .github/
│   ├── workflows/
│   │   └── pr-review.yml  ← 同じワークフローをコピー
│   └── scripts/
│       └── build_reviewer_prompt.py  ← 同じスクリプトをコピー
│
Repository C
├── .github/
│   ├── workflows/
│   │   └── pr-review.yml  ← また同じものをコピー...
│   └── scripts/
│       └── build_reviewer_prompt.py  ← また同じものをコピー...
```

**問題点：**
- ❌ スクリプト更新時に全リポジトリで更新が必要
- ❌ バージョン管理が困難
- ❌ メンテナンスコストが高い
- ❌ コピー漏れや更新漏れのリスク

### After（リモート方式）✨

```
Repository A
├── .github/
│   └── workflows/
│       └── pr-review-remote.yml  ← ワークフローだけ！
│
Repository B
├── .github/
│   └── workflows/
│       └── pr-review-remote.yml  ← ワークフローだけ！
│
Repository C
├── .github/
│   └── workflows/
│       └── pr-review-remote.yml  ← ワークフローだけ！

Central Repository (gemini-actions-lab)
├── .github/
│   └── scripts/
│       ├── build_reviewer_prompt.py  ← スクリプトは1箇所で管理
│       ├── clamp_diff.py
│       └── ensure_hf_space.py
```

**メリット：**
- ✅ スクリプトは中央リポジトリで一元管理
- ✅ 更新は1箇所だけでOK
- ✅ バージョン管理が容易
- ✅ メンテナンスコストが大幅削減
- ✅ 常に最新版を使用可能

## 🚀 導入手順

### ステップ1: ワークフローファイルをコピー

他のリポジトリで使いたいワークフローを選んでコピー：

```bash
# 例：Kozaki PR レビューを導入
cd YOUR_REPOSITORY
mkdir -p .github/workflows
curl -o .github/workflows/pr-review-kozaki.yml \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/workflows_remote/pr-review-kozaki-remote.yml
```

### ステップ2: 必要な設定を追加

GitHub リポジトリの Settings で以下を設定：

#### Secrets の設定

```
Settings → Secrets and variables → Actions → New repository secret
```

必要なシークレット：
- `GH_PAT_KOZAKI` (または使用するレビュワー名)
- `GEMINI_API_KEY`
- その他、ワークフローが要求するシークレット

#### Variables の設定（オプション）

```
Settings → Secrets and variables → Actions → Variables
```

GCP連携を使う場合：
- `GCP_WIF_PROVIDER`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `SERVICE_ACCOUNT_EMAIL`

### ステップ3: ペルソナファイルの配置（PR Reviewの場合）

```bash
# ペルソナプロンプトをコピー
mkdir -p .github/prompts
curl -o .github/prompts/reviewer-kozaki.md \
  https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/prompts/reviewer-kozaki.md
```

### ステップ4: 動作確認

PRを作成して、ワークフローが正常に動作することを確認！

## 📦 利用可能なワークフロー

### 1. PR Review ワークフロー

**ファイル:**
- `pr-review-kozaki-remote.yml`
- `pr-review-yukimura-remote.yml`
- `pr-review-onizuka-remote.yml`

**使用スクリプト:** `build_reviewer_prompt.py`

**トリガー:**
- PR opened
- PR reopened
- PR ready_for_review

**必要な設定:**
- Secrets: `GH_PAT_[REVIEWER_NAME]`, `GEMINI_API_KEY`
- Files: `.github/prompts/reviewer-[name].md`

**使用例:**
```yaml
# コピー後、このまま使えます！
# カスタマイズしたい場合は、環境変数を編集：
env:
  REVIEWER_DISPLAY: '🦊 あなたのレビュワー名'
  REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
  REMOTE_BRANCH: 'main'
```

### 2. Release Notes ワークフロー

**ファイル:** `gemini-release-notes-remote.yml`

**使用スクリプト:** `clamp_diff.py`

**トリガー:** タグのpush時に自動実行

**必要な設定:**
- Secrets: `GEMINI_API_KEY`
- Variables: GCP連携を使う場合は各種GCP設定

**使用例:**
```bash
# タグを作成してpushするだけ
git tag v1.0.0
git push origin v1.0.0

# 自動的にリリースノートが生成されます！
```

**カスタマイズ:**
```yaml
env:
  MAX_COMMITS: 300      # 最大コミット数
  MAX_DIFF_LINES: 2000  # 最大差分行数
  REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
  REMOTE_BRANCH: 'main'
```

### 3. HuggingFace Deploy ワークフロー

**ファイル:** `huggingface-space-deploy-remote.yml`

**使用スクリプト:** `ensure_hf_space.py`

**トリガー:** workflow_dispatch（手動実行）

**必要な設定:**
- Secrets: `HUGGINGFACE_TOKEN`

**使用例:**
```bash
# GitHub Actions UIから手動実行
# 以下のパラメータを入力：
# - space_slug: my-awesome-space
# - space_sdk: gradio
# - source_dir: .
```

**入力パラメータ:**
- `space_slug`: Spaceのスラッグ名（必須）
- `space_org`: 組織名（オプション）
- `space_sdk`: SDK種類（gradio, streamlit, etc.）
- `space_private`: プライベートかどうか
- `space_hardware`: ハードウェアティア（オプション）
- `source_dir`: デプロイするディレクトリ
- `space_branch`: pushするブランチ

### 4. Example ワークフロー

**ファイル:** `example-remote-script.yml`

**使用スクリプト:** 選択可能（全スクリプトのテスト用）

**トリガー:** workflow_dispatch（手動実行）

**目的:** リモートスクリプトダウンロードの動作確認

## 🔧 カスタマイズ

### スクリプトのバージョンを固定

特定バージョンを使いたい場合：

```yaml
env:
  REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
  REMOTE_BRANCH: 'v1.0.0'  # タグ名
  # または
  REMOTE_BRANCH: 'abc123def456'  # コミットSHA
```

### 独自のスクリプトリポジトリを使用

フォークしたリポジトリを使う場合：

```yaml
env:
  REMOTE_REPO: 'your-org/your-fork'
  REMOTE_BRANCH: 'main'
```

### ローカルスクリプトとの併用

緊急時のフォールバック：

```yaml
- name: Download remote script with fallback
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    
    # リモートから取得を試行
    if ! curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/script.py; then
      echo "⚠️ Remote download failed, using local fallback"
      cp .github/scripts/script.py /tmp/remote-scripts/script.py
    fi
```

## 🎓 ベストプラクティス

### 1. 本番環境では特定バージョンを使用

```yaml
env:
  REMOTE_BRANCH: 'v1.2.3'  # 本番ではタグを推奨
```

### 2. 開発環境では最新版を使用

```yaml
env:
  REMOTE_BRANCH: 'main'  # 開発では最新版でOK
```

### 3. エラーハンドリングを追加

```yaml
- name: Download with retry
  run: |
    for i in {1..3}; do
      if curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/script.py; then
        echo "✅ Downloaded successfully"
        break
      fi
      echo "⚠️ Attempt $i failed, retrying..."
      sleep 2
    done
```

### 4. スクリプトの整合性確認

```yaml
- name: Verify script integrity
  run: |
    EXPECTED_SHA="abc123..."
    ACTUAL_SHA=$(sha256sum /tmp/remote-scripts/script.py | awk '{print $1}')
    if [ "${ACTUAL_SHA}" != "${EXPECTED_SHA}" ]; then
      echo "❌ Integrity check failed"
      exit 1
    fi
```

## 🐛 トラブルシューティング

### 問題1: スクリプトがダウンロードできない

**症状:**
```
curl: (22) The requested URL returned error: 404
```

**解決方法:**
1. リポジトリがプライベートでないか確認
2. ブランチ名が正しいか確認
3. スクリプトのパスが正しいか確認

```bash
# URLを直接ブラウザで開いて確認
https://raw.githubusercontent.com/YOUR_REPO/YOUR_BRANCH/.github/scripts/YOUR_SCRIPT.py
```

### 問題2: Python実行時エラー

**症状:**
```
ModuleNotFoundError: No module named 'xxx'
```

**解決方法:**
依存関係をインストールするステップを追加：

```yaml
- name: Install dependencies
  run: |
    pip install requests jinja2
```

### 問題3: 権限エラー

**症状:**
```
Permission denied
```

**解決方法:**
```yaml
- name: Fix permissions
  run: |
    chmod +x /tmp/remote-scripts/*.py
```

## 📊 運用メトリクス

### 削減されるコピー作業

| 項目 | Before | After | 削減率 |
|------|--------|-------|--------|
| コピーするファイル数 | 2個/リポジトリ | 1個/リポジトリ | 50% |
| 更新時の作業リポジトリ数 | N個全部 | 1個だけ | 99%+ |
| メンテナンス工数 | O(N) | O(1) | 大幅削減 |

### 期待される効果

- ⏰ **時間削減**: 複数リポジトリへの展開時間が50%削減
- 🔄 **更新の容易さ**: スクリプト更新が1箇所で完結
- 🎯 **一貫性**: 全リポジトリで同じバージョンのスクリプトを使用
- 🛡️ **安全性**: バージョン固定で予期しない変更を防止

## 🔗 関連リソース

- [README.md](./README.md) - 基本的な使い方
- [TEMPLATE.md](./TEMPLATE.md) - スクリプトダウンロードパターン集
- [Example Workflow](./example-remote-script.yml) - 動作確認用サンプル
- [元のリポジトリ](https://github.com/Sunwood-ai-labsII/gemini-actions-lab)

## 💬 フィードバック

改善提案やバグ報告は Issue で受け付けてるよ〜！
みんなで使いやすくしていこう💪✨

---

**かわいく・しっかり・伸びしろ盛りで作るワークフロー管理、それな〜💕**
