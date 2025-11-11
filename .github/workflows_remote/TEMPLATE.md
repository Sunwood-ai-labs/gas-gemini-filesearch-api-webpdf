# 🎯 Remote Script Download Template

このテンプレートは、リモートリポジトリからスクリプトを取得して実行するワークフローの基本パターンだよ〜✨

## 基本パターン

### 1. シングルスクリプトの取得

```yaml
- name: Download remote script
  env:
    REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
    REMOTE_BRANCH: 'main'
    SCRIPT_PATH: '.github/scripts/build_reviewer_prompt.py'
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/${SCRIPT_PATH}"
    curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
    chmod +x /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
    echo "✨ Downloaded: ${SCRIPT_PATH}"

- name: Run remote script
  run: |
    python3 /tmp/remote-scripts/build_reviewer_prompt.py
```

### 2. 複数スクリプトの取得

```yaml
- name: Download remote scripts
  env:
    REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
    REMOTE_BRANCH: 'main'
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    
    # スクリプトリスト
    SCRIPTS=(
      "build_reviewer_prompt.py"
      "clamp_diff.py"
      "ensure_hf_space.py"
    )
    
    for script in "${SCRIPTS[@]}"; do
      SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/.github/scripts/${script}"
      curl -fsSL "${SCRIPT_URL}" -o "/tmp/remote-scripts/${script}"
      chmod +x "/tmp/remote-scripts/${script}"
      echo "✨ Downloaded: ${script}"
    done
```

### 3. スクリプトを関数として使う（clamp_diff パターン）

```yaml
- name: Setup remote scripts
  env:
    REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
    REMOTE_BRANCH: 'main'
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/.github/scripts/clamp_diff.py"
    curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/clamp_diff.py
    chmod +x /tmp/remote-scripts/clamp_diff.py

- name: Use clamp_diff in bash function
  run: |
    set -euo pipefail
    
    # Bash関数としてラップ
    clamp_diff() {
      local max_lines="$1"
      local max_chars="$2"
      python3 /tmp/remote-scripts/clamp_diff.py "$max_lines" "$max_chars"
    }
    
    # 使用例
    git diff --no-color HEAD~1..HEAD | clamp_diff 600 200000 > diff_output.txt
```

### 4. プライベートリポジトリからの取得

```yaml
- name: Download from private repo
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    REMOTE_REPO: 'your-org/private-repo'
    REMOTE_BRANCH: 'main'
    SCRIPT_PATH: '.github/scripts/my_script.py'
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/${SCRIPT_PATH}"
    
    # トークン認証を使用
    curl -fsSL \
      -H "Authorization: token ${GITHUB_TOKEN}" \
      "${SCRIPT_URL}" \
      -o /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
    
    chmod +x /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
```

### 5. 特定バージョン（タグ/コミット）の取得

```yaml
- name: Download specific version
  env:
    REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
    REMOTE_REF: 'v1.0.0'  # タグ、ブランチ、またはコミットSHA
    SCRIPT_PATH: '.github/scripts/build_reviewer_prompt.py'
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_REF}/${SCRIPT_PATH}"
    curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
    chmod +x /tmp/remote-scripts/$(basename ${SCRIPT_PATH})
```

## ベストプラクティス 🌟

### 1. エラーハンドリング

```yaml
- name: Download with error handling
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/${SCRIPT_PATH}"
    
    if ! curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/script.py; then
      echo "❌ Failed to download script from ${SCRIPT_URL}"
      exit 1
    fi
    
    echo "✅ Successfully downloaded script"
```

### 2. キャッシュの活用

```yaml
- name: Cache remote scripts
  uses: actions/cache@v3
  with:
    path: /tmp/remote-scripts
    key: remote-scripts-${{ env.REMOTE_REPO }}-${{ env.REMOTE_BRANCH }}-${{ hashFiles('.github/workflows/*.yml') }}

- name: Download if not cached
  run: |
    if [ ! -f /tmp/remote-scripts/script.py ]; then
      mkdir -p /tmp/remote-scripts
      curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/script.py
    fi
```

### 3. 検証（チェックサム）

```yaml
- name: Download and verify
  run: |
    set -euo pipefail
    mkdir -p /tmp/remote-scripts
    
    SCRIPT_URL="https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/${SCRIPT_PATH}"
    EXPECTED_SHA256="abc123..."  # 期待されるSHA256ハッシュ
    
    curl -fsSL "${SCRIPT_URL}" -o /tmp/remote-scripts/script.py
    
    ACTUAL_SHA256=$(sha256sum /tmp/remote-scripts/script.py | awk '{print $1}')
    if [ "${ACTUAL_SHA256}" != "${EXPECTED_SHA256}" ]; then
      echo "❌ Checksum mismatch!"
      exit 1
    fi
```

## 使用例：実際のワークフロー 💪

### PR Review ワークフロー

```yaml
name: 'PR Review with Remote Script'

on:
  pull_request:
    types: [opened, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    env:
      REMOTE_REPO: 'Sunwood-ai-labsII/gemini-actions-lab'
      REMOTE_BRANCH: 'main'
    steps:
      - uses: actions/checkout@v4
      
      # リモートスクリプト取得🚀
      - name: Download review script
        run: |
          mkdir -p /tmp/remote-scripts
          curl -fsSL \
            "https://raw.githubusercontent.com/${REMOTE_REPO}/${REMOTE_BRANCH}/.github/scripts/build_reviewer_prompt.py" \
            -o /tmp/remote-scripts/build_reviewer_prompt.py
          chmod +x /tmp/remote-scripts/build_reviewer_prompt.py
      
      # スクリプト実行
      - name: Build prompt
        env:
          PERSONA_PATH: '.github/prompts/reviewer.md'
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          python3 /tmp/remote-scripts/build_reviewer_prompt.py
```

## トラブルシューティング 🔧

### 問題: ファイルが見つからない

```bash
# デバッグ用：URLを確認
echo "Trying to download from: ${SCRIPT_URL}"
curl -I "${SCRIPT_URL}"  # ヘッダーのみ取得
```

### 問題: 権限エラー

```bash
# ダウンロード後に実行権限を付与
chmod +x /tmp/remote-scripts/*.py
```

### 問題: Pythonの依存関係

```yaml
- name: Install Python dependencies
  run: |
    pip install -r /tmp/remote-scripts/requirements.txt || true
```

---

**リモートスクリプトで楽々メンテ、よき〜！💕**
