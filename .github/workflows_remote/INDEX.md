# 📚 リモートワークフロー - ドキュメント索引

よき〜！このフォルダのドキュメント一覧だよ〜✨

## 🎯 クイックナビゲーション

### 💨 とにかく早く始めたい
👉 [QUICKSTART.md](./QUICKSTART.md) - 5分で導入完了！

### 📖 しっかり理解して使いたい
👉 [README.md](./README.md) - 基本的な使い方とトラブルシューティング

### 🎓 詳しく学びたい
👉 [GUIDE.md](./GUIDE.md) - 完全導入・運用ガイド

### 🔧 カスタマイズしたい
👉 [TEMPLATE.md](./TEMPLATE.md) - スクリプトダウンロードパターン集

### ⚖️ ローカル版と比較したい
👉 [COMPARISON.md](./COMPARISON.md) - 詳細な比較分析

## 📂 ファイル一覧

### ドキュメント

| ファイル | 説明 | おすすめ度 |
|---------|------|-----------|
| [QUICKSTART.md](./QUICKSTART.md) | 5分で始める導入ガイド | ⭐⭐⭐⭐⭐ |
| [README.md](./README.md) | 基本的な使い方 | ⭐⭐⭐⭐⭐ |
| [GUIDE.md](./GUIDE.md) | 詳細な導入・運用ガイド | ⭐⭐⭐⭐ |
| [TEMPLATE.md](./TEMPLATE.md) | カスタマイズパターン集 | ⭐⭐⭐ |
| [COMPARISON.md](./COMPARISON.md) | ローカル版との比較 | ⭐⭐⭐ |

### ワークフローファイル

| ファイル | 説明 | 使用スクリプト |
|---------|------|---------------|
| [pr-review-kozaki-remote.yml](./pr-review-kozaki-remote.yml) | PRレビュー（Kozaki） | build_reviewer_prompt.py |
| [pr-review-yukimura-remote.yml](./pr-review-yukimura-remote.yml) | PRレビュー（Yukimura） | build_reviewer_prompt.py |
| [pr-review-onizuka-remote.yml](./pr-review-onizuka-remote.yml) | PRレビュー（Onizuka） | build_reviewer_prompt.py |
| [gemini-release-notes-remote.yml](./gemini-release-notes-remote.yml) | リリースノート自動生成 | clamp_diff.py |
| [huggingface-space-deploy-remote.yml](./huggingface-space-deploy-remote.yml) | HuggingFaceデプロイ | ensure_hf_space.py |
| [example-remote-script.yml](./example-remote-script.yml) | 動作確認用サンプル | 全スクリプト（選択可） |

## 🎓 学習パス

### 初心者向け（まずはこれ！）

1. **[QUICKSTART.md](./QUICKSTART.md)** を読む（5分）
2. サンプルワークフローをコピーして試す（10分）
3. 動作確認（5分）

**合計: 20分で導入完了！** 🎉

### 中級者向け（しっかり理解）

1. **[README.md](./README.md)** で全体像を把握（10分）
2. **[GUIDE.md](./GUIDE.md)** で詳細を理解（20分）
3. **[TEMPLATE.md](./TEMPLATE.md)** でカスタマイズ方法を学ぶ（15分）
4. 実際にカスタマイズして使う（30分）

**合計: 1時間ちょっとで完全理解！** 💪

### 上級者向け（深く掘り下げ）

1. **[COMPARISON.md](./COMPARISON.md)** でローカル版との違いを分析（15分）
2. **[TEMPLATE.md](./TEMPLATE.md)** で高度なパターンを学ぶ（20分）
3. 独自のワークフローパターンを設計（60分）
4. チームに展開・共有（30分）

**合計: 2時間で達人レベル！** 🚀

## 💡 ユースケース別ガイド

### 「とりあえず試したい」
→ [QUICKSTART.md](./QUICKSTART.md) だけ読めばOK！

### 「複数リポジトリで使いたい」
→ [README.md](./README.md) → [GUIDE.md](./GUIDE.md) の順で読む

### 「既存のローカル版から移行したい」
→ [COMPARISON.md](./COMPARISON.md) → [GUIDE.md](./GUIDE.md) の移行ガイド

### 「独自にカスタマイズしたい」
→ [TEMPLATE.md](./TEMPLATE.md) → 実装

### 「チーム全体に導入したい」
→ [GUIDE.md](./GUIDE.md) → [COMPARISON.md](./COMPARISON.md) → チーム展開

## 🔗 関連リンク

### 内部リンク
- [元のワークフロー](../.github/workflows/) - ローカル版の参考実装
- [スクリプト](../.github/scripts/) - 実際に使用されるPythonスクリプト
- [アーキテクチャ](../.github/workflows/architecture.md) - 全体アーキテクチャ

### 外部リンク
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
- [Gemini API](https://ai.google.dev/)

## 📊 ドキュメント統計

```
総ページ数: 5ファイル
総文字数: 約25,000文字
読了時間: 約45分（全部読む場合）
```

## 🎯 よくある質問への答え

**Q: どのドキュメントから読めばいい？**
A: → [QUICKSTART.md](./QUICKSTART.md) から始めるのが一番！

**Q: ローカル版とどう違うの？**
A: → [COMPARISON.md](./COMPARISON.md) で詳しく比較してるよ〜

**Q: カスタマイズ方法は？**
A: → [TEMPLATE.md](./TEMPLATE.md) にパターン集があるよ！

**Q: トラブルが起きたら？**
A: → [README.md](./README.md) のトラブルシューティングセクションを見てね

**Q: 本番環境で使っても大丈夫？**
A: → [GUIDE.md](./GUIDE.md) のベストプラクティスを参考に！

## 🤝 コントリビューション

改善提案やバグ報告は Issue で受け付けてるよ〜！
- [Issue を開く](https://github.com/Sunwood-ai-labsII/gemini-actions-lab/issues)

## 📝 ライセンス

このドキュメントは MIT ライセンスの下で公開されています。

---

**かわいく・しっかり・伸びしろ盛りで学ぶワークフロー管理、よき〜！💕**

最終更新: 2025-11-11
