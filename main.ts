import {
  Plugin,
  TFile,
  Notice,
  PluginSettingTab,
  App,
  Setting
} from "obsidian";
import { Mistral } from "@mistralai/mistralai";

// 翻訳辞書
const translations = {
  en: {
    convert: "Convert PDF to Markdown",
    noticeUploading: "Uploading PDF to Mistral...",
    noticeSuccess: "Converted to Markdown.",
    noticeNoKey: "Mistral API key is not set. Please check plugin settings.",
    noticeError: "An error occurred during OCR.",
    settingHeader: "PDF to Markdown Settings",
    settingApiKey: "Mistral API Key",
    settingApiKeyDesc: "Enter your Mistral API key used for OCR conversion."
  },
  ja: {
    convert: "PDFをMarkdownに変換",
    noticeUploading: "PDFをMistralにアップロード中…",
    noticeSuccess: "Markdownに変換しました。",
    noticeNoKey: "MistralのAPIキーが設定されていません。設定画面で入力してください。",
    noticeError: "OCR中にエラーが発生しました。",
    settingHeader: "PDF → Markdown 設定",
    settingApiKey: "Mistral APIキー",
    settingApiKeyDesc: "OCR変換に使用するMistralのAPIキーを入力してください。"
  }
};

// 設定型
interface PluginSettings {
  apiKey: string;
}

// デフォルト設定
const DEFAULT_SETTINGS: PluginSettings = {
  apiKey: ""
};

export default class PdfToMarkdownPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new PdfToMarkdownSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        const locale = window.localStorage.getItem('language') || "en";
        const t = translations[locale as keyof typeof translations] ?? translations["en"];

        if (file instanceof TFile && file.extension === "pdf") {
          menu.addItem((item) =>
            item.setTitle(t.convert).onClick(() => this.convertPdfToMarkdown(file, t))
          );
        }
      })
    );
  }

  async convertPdfToMarkdown(file: TFile, t: typeof translations["en"]) {
    if (!this.settings.apiKey) {
      new Notice(t.noticeNoKey);
      return;
    }

    const client = new Mistral({ apiKey: this.settings.apiKey });

    try {
      new Notice(t.noticeUploading);

      const arrayBuffer = await this.app.vault.readBinary(file);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const namedFile = new File([blob], file.name, { type: "application/pdf" });

      const uploadedFile = await client.files.upload({
        file: namedFile,
        purpose: "ocr"
      });

      const signedUrl = await client.files.getSignedUrl({
        fileId: uploadedFile.id
      });

      const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url
        }
      });

      const markdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
      const mdPath = file.path.replace(/\.pdf$/, ".md");
      await this.app.vault.create(mdPath, markdown);

      new Notice(t.noticeSuccess);
    } catch (err) {
      console.error(err);
      new Notice(t.noticeError);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class PdfToMarkdownSettingTab extends PluginSettingTab {
  plugin: PdfToMarkdownPlugin;

  constructor(app: App, plugin: PdfToMarkdownPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const locale = window.localStorage.getItem('language') || "en";
    const t = translations[locale as keyof typeof translations] ?? translations["en"];

    containerEl.empty();
    containerEl.createEl("h2", { text: t.settingHeader });

    new Setting(containerEl)
      .setName(t.settingApiKey)
      .setDesc(t.settingApiKeyDesc)
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );
  }
}