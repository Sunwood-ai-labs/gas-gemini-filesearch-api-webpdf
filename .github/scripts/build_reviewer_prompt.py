#!/usr/bin/env python3
"""Compose persona-specific review prompts for the multi-review workflow."""

from __future__ import annotations

import os
from pathlib import Path


def read_text(path_str: str | None, fallback: str) -> str:
    if not path_str:
        return fallback
    path = Path(path_str)
    if not path.exists():
        return fallback
    text = path.read_text(encoding="utf-8", errors="replace").strip()
    return text or fallback


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if value is None:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def main() -> None:
    persona = read_text(require_env("PERSONA_PATH"), "")
    if not persona:
        raise RuntimeError("Persona prompt content is empty.")

    repo = require_env("GITHUB_REPOSITORY")
    pr_number = require_env("PR_NUMBER")
    title = require_env("PR_TITLE")
    author = require_env("PR_AUTHOR")
    base_ref = require_env("PR_BASE")
    head_ref = require_env("PR_HEAD")
    additions = require_env("PR_ADDITIONS")
    deletions = require_env("PR_DELETIONS")
    files_changed = require_env("PR_FILES_CHANGED")

    body = read_text(os.environ.get("BODY_PATH"), "(PR本文は提供されていません)")
    files = read_text(os.environ.get("FILES_PATH"), "(変更ファイル一覧は取得できませんでした)")
    diff_excerpt = read_text(os.environ.get("DIFF_PATH"), "(Diff excerpt unavailable)")

    prompt = f"""{persona}

## コンテキスト
- Repository: {repo}
- Pull Request: #{pr_number}
- Title: {title}
- Author: {author}
- Branches: {head_ref} -> {base_ref}
- Stats: +{additions} / -{deletions} across {files_changed} files

## PR Body
{body}

## Changed Files (up to 40 entries)
{files}

## Diff Excerpt (first 600 lines max)
```diff
{diff_excerpt}
```

## 指示
上記の情報を踏まえ、ペルソナのレビュー方針と出力フォーマットに厳密に従ってMarkdownコメントを作成してください。
"""

    output_path = Path(os.environ.get("PROMPT_OUTPUT_PATH", "prompt.txt"))
    output_path.write_text(prompt, encoding="utf-8")


if __name__ == "__main__":
    main()
