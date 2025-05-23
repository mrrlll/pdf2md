# Obsidian PDF → Markdown 変換プラグイン（Mistral OCR対応）

このプラグインは、Obsidianのファイルエクスプローラー上でPDFを右クリックし、Mistral OCRを使ってMarkdownに変換できる機能を提供します。スキャンされたPDFや通常のPDFから、整形されたテキストをMarkdown形式で抽出・保存できます。

---

## ✨ 主な機能

- 📄 PDFファイルを右クリックして「PDFをMarkdownに変換」を選択可能
- 🧠 高精度なOCRエンジン [Mistral OCR](https://github.com/mistralai/client-ts) を使用
- 💾 Markdown形式のテキストを、PDFと同じフォルダに自動保存
- 🔐 APIキーはObsidianの設定画面から入力・管理可能

---

## 🔧 インストール方法

> ⚠️ 現在このプラグインは Obsidian のコミュニティプラグイン一覧には登録されていません。手動インストールが必要です。

1. このリポジトリをクローンまたはZIPでダウンロード
2. 以下のコマンドでビルド

   ```bash
   npm install
   npm run build
