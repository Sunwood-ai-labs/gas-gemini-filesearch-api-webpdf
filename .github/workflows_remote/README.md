# 🚀 Remote Workflows Guide

よき〜！このフォルダには、リモートリポジトリからスクリプトを取得・実行するワークフローが入ってるよ〜✨

## 📋 なぜリモートワークフロー？

従来の問題：
- ワークフローをコピーするたびにPythonスクリプトもコピーが必要
- スクリプトが更新されたら全部のリポジトリで更新しないといけない
- メンテナンスが大変すぎる〜😭

解決策：
- スクリプトはリモートリポジトリから取得
- 各リポジトリはワークフローファイルだけコピー
- スクリプトの更新は1箇所でOK💪

## 🎀 使い方

### 1. ワークフローファイルをコピー

他のリポジトリで使いたいワークフローを `.github/workflows/` にコピーするだけ！

```bash
# 例：PR レビュワーワークフローをコピー
cp .github/workflows_remote/pr-review-kozaki-remote.yml YOUR_REPO/.github/workflows/
```

### 2. 必要な設定

各ワークフローで必要なシークレットや設定：

#### PR Review ワークフロー (Kozaki/Yukimura/Onizuka)
- **Secrets**:
  - `GH_PAT_KOZAKI` / `GH_PAT_YUKIMURA` / `GH_PAT_ONIZUKA`: GitHub Personal Access Token
  - `GEMINI_API_KEY`: Gemini APIキー
- **Variables**:
  - `GCP_WIF_PROVIDER`: GCP Workload Identity Provider (optional)
  - `GOOGLE_CLOUD_PROJECT`: GCPプロジェクトID (optional)
  - その他のGemini設定変数

#### Release Notes ワークフロー
- **Secrets**:
  - `GEMINI_API_KEY`: Gemini APIキー
- **その他**: タグ push 時に自動実行

#### HuggingFace Deploy ワークフロー
- **Secrets**:
  - `HF_TOKEN`: HuggingFace トークン
  - `GEMINI_API_KEY`: Gemini APIキー

### 3. ペルソナプロンプトの準備

PR Reviewワークフローを使う場合は、ペルソナプロンプトファイルも必要だよ〜📝

```bash
# ペルソナプロンプトをコピー
mkdir -p YOUR_REPO/.github/prompts/
cp .github/prompts/reviewer-kozaki.md YOUR_REPO/.github/prompts/
```

## 🔧 カスタマイズ

### リモートリポジトリの変更

デフォルトでは `Sunwood-ai-labsII/gemini-actions-lab` の `main` ブランチから取得するけど、
変更したい場合はワークフローファイルの環境変数を編集してね！

```yaml
env:
  REMOTE_REPO: 'YOUR_ORG/YOUR_REPO'
  REMOTE_BRANCH: 'main'
```

### スクリプトのバージョン固定

特定のコミットやタグからスクリプトを取得したい場合：

```yaml
env:
  REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
  REMOTE_BRANCH: 'v1.0.0'  # タグやコミットSHAを指定
```

## 📦 利用可能なワークフロー

### PR Review ワークフロー ✅
- `pr-review-kozaki-remote.yml` - 🦊 狐崎煌羽によるレビュー
- `pr-review-yukimura-remote.yml` - ⚡ 雪村煌星によるレビュー
- `pr-review-onizuka-remote.yml` - 🔥 鬼塚炎龍によるレビュー

使用スクリプト: `build_reviewer_prompt.py`

### Release Notes ワークフロー ✅
- `gemini-release-notes-remote.yml` - 📝 リリースノート自動生成

使用スクリプト: `clamp_diff.py`

トリガー: タグのpush時に自動実行

### HuggingFace Deploy ワークフロー ✅
- `huggingface-space-deploy-remote.yml` - 🤗 HuggingFaceへの自動デプロイ

使用スクリプト: `ensure_hf_space.py`

トリガー: 手動実行（workflow_dispatch）

## 🎯 開発原則 (SOLID/KISS/YAGNI/DRY)

### DRY (Don't Repeat Yourself) 💎
スクリプトの重複を排除！リモートから一元管理で楽々メンテ〜

### KISS (Keep It Simple) 🎀
シンプルな `curl` でスクリプト取得。複雑な仕組み不要！

### YAGNI (You Aren't Gonna Need It) ✨
必要最小限の実装。過剰な抽象化は避けてる〜

### O (Open/Closed Principle) 🔒
既存ワークフローは変更せず、新しいリモート版を追加。拡張に開放、変更に閉鎖！

## 🐛 トラブルシューティング

### スクリプトのダウンロードが失敗する

```bash
# ステップのログを確認
curl -fsSL "https://raw.githubusercontent.com/Sunwood-ai-labsII/gemini-actions-lab/main/.github/scripts/build_reviewer_prompt.py"
```

原因：
- リポジトリがプライベート → パブリックにするか、認証トークンを追加
- ブランチ名が間違っている → `REMOTE_BRANCH` を確認
- スクリプトパスが変更された → 最新のパスを確認

### Python実行エラー

スクリプトに必要な依存関係がある場合は、事前にインストールするステップを追加：

```yaml
- name: Install Python dependencies
  run: |
    pip install requests jinja2
```

## 💡 Tips

1. **キャッシュ活用**: 同じワークフロー内で複数回スクリプトを使う場合は、一度ダウンロードして使い回す
2. **バージョン管理**: 本番では特定のタグやコミットSHAを使うと安定するよ〜
3. **ローカルテスト**: ワークフロー追加前にスクリプトが取得できるか確認！

## 🔗 関連リンク

- [元のリポジトリ](https://github.com/Sunwood-ai-labsII/gemini-actions-lab)
- [スクリプト一覧](./.github/scripts/)
- [従来のワークフロー](./.github/workflows/)

---

**かわいく・しっかり・伸びしろ盛りで作るワークフロー管理、それな〜💕**
