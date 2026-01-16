var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
__export(exports, {
  default: () => AIObsidianPlugin
});
var import_obsidian = __toModule(require("obsidian"));
var import_child_process = __toModule(require("child_process"));
var import_util = __toModule(require("util"));
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var DEFAULT_SETTINGS = {
  reviewDirectory: "99-System/Archive/ai-reviews",
  watchedFolders: ["04-Investigations", "08-Service", "01-Journal/Daily"],
  aiCliPath: "",
  enableNotifications: true,
  triggerKeyword: "ai",
  questionSuffix: "??"
};
var AIObsidianPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.processing = new Set();
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      console.log("Obsidian AI Assistant loaded");
      this.addCommand({
        id: "trigger-ai-assistant",
        name: "Trigger AI Assistant",
        editorCallback: (editor, view) => {
          if (view.file) {
            this.triggerAssistant(view.file);
          }
        }
      });
      this.registerEvent(this.app.vault.on("modify", (file) => {
        if (file instanceof import_obsidian.TFile && file.extension === "md") {
          console.log("File modified:", file.path);
          this.checkForTrigger(file);
        }
      }));
      this.addSettingTab(new AIObsidianSettingTab(this.app, this));
    });
  }
  checkForTrigger(file) {
    return __async(this, null, function* () {
      if (this.processing.has(file.path)) {
        console.log("Already processing:", file.path);
        return;
      }
      const content = yield this.app.vault.read(file);
      console.log("Checking for trigger in:", file.path);
      const keyword = this.settings.triggerKeyword;
      const suffix = this.settings.questionSuffix;
      const questionRegex = new RegExp(`${keyword} (.+?)${suffix.replace(/\?/g, '\\?')}`, "g");
      let match;
      let hasQuestion = false;
      while ((match = questionRegex.exec(content)) !== null) {
        hasQuestion = true;
        const fullMatch = match[0];
        const question = match[1];
        if (!content.includes(`${fullMatch}

> `)) {
          console.log("Question found:", question);
          this.processing.add(file.path);
          yield this.answerQuestion(file, content, fullMatch, question);
          this.processing.delete(file.path);
          return;
        }
      }
      if (!hasQuestion) {
        console.log("No trigger found");
      }
    });
  }
  triggerAssistant(file) {
    return __async(this, null, function* () {
      console.log("Hotkey pressed - triggering AI assistant for:", file.path);
      if (!this.settings.aiCliPath) {
        const currentContent = yield this.app.vault.read(file);
        const helpMessage = `

> [!warning] AI CLI Not Configured
> Please configure your AI CLI path in Settings:
> 1. Go to **Settings → Obsidian AI Assistant → AI CLI path**
> 2. Find your CLI path by running: \`which <your-cli-name>\` in terminal
> 3. Paste the full path (e.g., \`/usr/local/bin/kiro-cli\`)`;
        yield this.app.vault.modify(file, currentContent + helpMessage);
        return;
      }
      if (this.processing.has(file.path)) {
        console.log("Already in progress");
        new import_obsidian.Notice("AI assistant already in progress");
        return;
      }
      const prompt = yield this.getPrompt(file);
      if (!prompt) {
        console.log("No prompt.md found in folder");
        const content = yield this.app.vault.read(file);
        const message = `> ${this.settings.triggerKeyword}: No prompt.md file found in the root folder of this note. To use the AI assistant hotkey, create a prompt.md file with instructions. Or ask questions directly using: ${this.settings.triggerKeyword} <question>${this.settings.questionSuffix}`;
        yield this.app.vault.modify(file, `${content}

${message}`);
        new import_obsidian.Notice("No prompt.md found - see note for details");
        return;
      }
      console.log("Starting AI assistant workflow...");
      const content = yield this.app.vault.read(file);
      const contentWithStatus = `${content}

> *Started workflow...*`;
      yield this.app.vault.modify(file, contentWithStatus);
      this.processing.add(file.path);
      yield this.performReview(file, content);
      this.processing.delete(file.path);
    });
  }
  answerQuestion(file, content, fullMatch, question) {
    return __async(this, null, function* () {
      try {
        if (!this.settings.aiCliPath) {
          const currentContent = yield this.app.vault.read(file);
          const helpMessage = `

> [!warning] AI CLI Not Configured
> Please configure your AI CLI path in Settings:
> 1. Go to **Settings → Obsidian AI Assistant → AI CLI path**
> 2. Find your CLI path by running: \`which <your-cli-name>\` in terminal
> 3. Paste the full path (e.g., \`/usr/local/bin/kiro-cli\`)`;
          yield this.app.vault.modify(file, currentContent + helpMessage);
          return;
        }
        console.log("Answering question:", question);
        const questionWithoutSuffix = fullMatch.replace(this.settings.questionSuffix, '');
        const contentWithoutTrigger = content.replace(fullMatch, `${questionWithoutSuffix}

> *Thinking...*`);
        yield this.app.vault.modify(file, contentWithoutTrigger);
        const folderPath = file.parent ? file.parent.path : "/";
        const vaultPath = this.app.vault.adapter.basePath;
        const vaultName = this.app.vault.getName();
        const allFolders = this.app.vault.getAllLoadedFiles()
          .filter(f => f.children)
          .map(f => f.path)
          .slice(0, 50)
          .join(", ");
        const prompt = `You are an Obsidian AI Assistant helping users manage their notes and knowledge base.

WORKSPACE CONTEXT:
- Vault: ${vaultName}
- Vault path: ${vaultPath}
- Current folder: ${folderPath}
- Current file: ${file.path}
- Current file size: ${content.length} characters
- Main folders: ${allFolders}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions

USER QUESTION: ${question}

CURRENT FILE CONTENT:
${content}

Answer concisely and actionably.`;
        const { stdout } = yield execAsync(`echo "${prompt.replace(/"/g, '\\"')}" | ${this.settings.aiCliPath} chat --non-interactive --trust-all-tools`, { maxBuffer: 10 * 1024 * 1024 });
        const answer = stdout.trim()
          .replace(/\x1b\[[0-9;]*m/g, '')
          .replace(/\d+m> ?m/g, '')
          .replace(/\[38;5;\d+m/g, '')
          .replace(/\[0m/g, '')
          .replace(/^>\s*/gm, '')
          .trim();
        const updatedContent = yield this.app.vault.read(file);
        const finalContent = updatedContent.replace(/>\s*\*Thinking\.\.\.\*\s*\n*/g, `---\n**AI Assistant**\n\n${answer}\n\n---\n`);
        yield this.app.vault.modify(file, finalContent);
        if (this.settings.enableNotifications) {
          new import_obsidian.Notice("Question answered");
        }
      } catch (error) {
        console.error("Kiro answer error:", error);
        const currentContent = yield this.app.vault.read(file);
        const errorContent = currentContent.replace(/> \*Thinking\.\.\.\*/, `> *Error: ${error.message}*`);
        yield this.app.vault.modify(file, errorContent);
        new import_obsidian.Notice(`Answer failed: ${error.message}`);
      }
    });
  }
  performReview(file, content) {
    return __async(this, null, function* () {
      try {
        console.log("=== AI Assistant Workflow Started ===");
        const prompt = yield this.getPrompt(file);
        console.log("Prompt loaded, length:", prompt ? prompt.length : 0);
        const folderPath = file.parent ? file.parent.path : "/";
        const vaultPath = this.app.vault.adapter.basePath;
        const vaultName = this.app.vault.getName();
        const allFolders = this.app.vault.getAllLoadedFiles()
          .filter(f => f.children)
          .map(f => f.path)
          .slice(0, 50)
          .join(", ");
        console.log("Context gathered - folder:", folderPath);
        const fullPrompt = `You are an Obsidian AI Assistant helping users manage their notes and knowledge base.

WORKSPACE CONTEXT:
- Vault: ${vaultName}
- Vault path: ${vaultPath}
- Current folder: ${folderPath}
- Current file: ${file.path}
- Current file size: ${content.length} characters
- Main folders: ${allFolders}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If the task requires destructive actions, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions

USER PROMPT:
${prompt}

CURRENT FILE CONTENT:
${content}`;
        const reviewDir = this.settings.reviewDirectory;
        if (!(yield this.app.vault.adapter.exists(reviewDir))) {
          yield this.app.vault.createFolder(reviewDir);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
        const basename = file.basename;
        const reviewPath = `${reviewDir}/${basename}-${timestamp}.md`;
        const input = `${fullPrompt}`;
        console.log("Executing kiro-cli, input length:", input.length);
        console.log("Command:", `${this.settings.aiCliPath} chat --non-interactive --trust-all-tools`);
        const startTime = Date.now();
        const { stdout } = yield execAsync(`echo "${input.replace(/"/g, '\\"')}" | ${this.settings.aiCliPath} chat --non-interactive --trust-all-tools`, { maxBuffer: 10 * 1024 * 1024 });
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Kiro-cli completed in ${duration}s, output length:`, stdout.length);
        console.log("Cleaning output...");
        const ai_response = stdout.trim()
          .replace(/\x1b\[[0-9;]*m/g, '')
          .replace(/\d+m> ?m/g, '')
          .replace(/\[38;5;\d+m/g, '')
          .replace(/\[0m/g, '')
          .replace(/^>\s*/gm, '')
          .trim();
        console.log("Cleaned output length:", ai_response.length);
        console.log("Updating file with response...");
        const currentContent = yield this.app.vault.read(file);
        const contentWithoutStatus = currentContent.replace(/>\s*\*Started workflow\.\.\.\*\s*\n*/g, '');
        const calloutResponse = ai_response.split('\n').map(line => `> ${line}`).join('\n');
        const updatedContent = `${contentWithoutStatus}

---
**AI Assistant**

${ai_response}

---`;
        yield this.app.vault.modify(file, updatedContent);
        console.log("File updated successfully");
        console.log("=== AI Assistant Workflow Completed ===");
        if (this.settings.enableNotifications) {
          new import_obsidian.Notice(`AI assistant completed`);
        }
      } catch (error) {
        console.error("AI assistant error:", error);
        new import_obsidian.Notice(`AI assistant failed: ${error.message}`);
      }
    });
  }
  getPrompt(file) {
    return __async(this, null, function* () {
      const folder = file.parent;
      if (folder) {
        const promptPath = `${folder.path}/prompt.md`;
        if (yield this.app.vault.adapter.exists(promptPath)) {
          const promptFile = this.app.vault.getAbstractFileByPath(promptPath);
          if (promptFile instanceof import_obsidian.TFile) {
            return yield this.app.vault.read(promptFile);
          }
        }
      }
      return null;
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
var AIObsidianSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Review directory").setDesc("Where to save AI review files").addText((text) => text.setPlaceholder("99-System/Archive/ai-reviews").setValue(this.plugin.settings.reviewDirectory).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.reviewDirectory = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("AI CLI path").setDesc("Path to your AI CLI executable").addText((text) => text.setPlaceholder("/path/to/cli").setValue(this.plugin.settings.aiCliPath).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.aiCliPath = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Trigger keyword").setDesc("Keyword to trigger questions (e.g., 'kiro what should I do??')").addText((text) => text.setPlaceholder("kiro").setValue(this.plugin.settings.triggerKeyword).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.triggerKeyword = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Question suffix").setDesc("Suffix to trigger questions (e.g., '??' to avoid triggering on single '?')").addText((text) => text.setPlaceholder("??").setValue(this.plugin.settings.questionSuffix).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.questionSuffix = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Enable notifications").setDesc("Show notification when review completes").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableNotifications).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.enableNotifications = value;
      yield this.plugin.saveSettings();
    })));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
