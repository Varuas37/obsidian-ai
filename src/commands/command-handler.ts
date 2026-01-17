/**
 * Command Handler - Handles all plugin commands with complete functionality
 * Restores all original hotkey and command functionality
 */

import { App, Modal, Notice } from 'obsidian';
import { AIService } from '../core/ai-service';
import { SettingsManager } from '../settings/settings-manager';
import { FileHandler } from '../files/file-handler';

export class CommandHandler {
  constructor(
    private app: App,
    private aiService: AIService,
    private settingsManager: SettingsManager,
    private fileHandler: FileHandler
  ) {}

  /**
   * Register all plugin commands
   */
  registerCommands(plugin: any): void {
    // Original trigger AI assistant command
    plugin.addCommand({
      id: "trigger-ai-assistant",
      name: "Trigger AI Assistant",
      editorCallback: (editor: any, view: any) => {
        if (view.file) {
          this.handleTriggerAssistant(view.file);
        }
      }
    });

    // Open AI Chat command
    plugin.addCommand({
      id: "open-ai-chat",
      name: "Open AI Chat",
      callback: () => {
        this.handleOpenChat(plugin);
      }
    });

    // Clear Chat History command
    plugin.addCommand({
      id: "clear-ai-chat",
      name: "Clear AI Chat History",
      callback: () => {
        this.handleClearChat(plugin);
      }
    });

    // Quick AI Question command
    plugin.addCommand({
      id: "quick-ai-question",
      name: "Quick AI Question",
      callback: () => {
        this.handleQuickQuestion();
      }
    });

    // Switch AI Provider command
    plugin.addCommand({
      id: "switch-ai-provider",
      name: "Switch AI Provider",
      callback: () => {
        this.handleSwitchProvider();
      }
    });
  }

  /**
   * Handle the trigger AI assistant command (original hotkey functionality)
   */
  async handleTriggerAssistant(file: any): Promise<void> {
    console.log("Hotkey pressed - triggering AI assistant for:", file.path);
    
    const settings = this.settingsManager.getSettings();
    const isConfigured = this.settingsManager.isProviderConfigured();
    
    if (!isConfigured) {
      await this.showConfigurationHelpInFile(file, settings.aiProvider);
      return;
    }

    if (this.fileHandler.isProcessing(file.path)) {
      console.log("Already in progress");
      new Notice("AI assistant already in progress for this file");
      return;
    }

    try {
      // Use the file handler's workflow processing
      await this.fileHandler.processWorkflow(file);
      
    } catch (error: any) {
      console.error("AI assistant workflow error:", error);
      new Notice(`AI assistant failed: ${error.message}`);
    }
  }

  /**
   * Handle opening the chat view
   */
  async handleOpenChat(plugin: any): Promise<void> {
    try {
      await plugin.activateChatView();
    } catch (error) {
      console.error("Failed to open chat:", error);
      new Notice("Failed to open AI chat");
    }
  }

  /**
   * Handle clearing chat history
   */
  handleClearChat(plugin: any): void {
    try {
      // Find and clear the React chat view
      const existing = this.app.workspace.getLeavesOfType("ai-chat-view");
      if (existing.length > 0) {
        const view = existing[0].view as any;
        if (view && typeof view.refresh === 'function') {
          view.refresh();
        }
      }
      new Notice("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear chat:", error);
      new Notice("Failed to clear chat history");
    }
  }

  /**
   * Handle quick question modal
   */
  async handleQuickQuestion(): Promise<void> {
    const modal = new QuickQuestionModal(this.app, async (question) => {
      if (question.trim()) {
        try {
          const response = await this.aiService.askQuestion(question);
          new Notice("Answer copied to clipboard");
          await navigator.clipboard.writeText(response);
        } catch (error: any) {
          new Notice(`Error: ${error.message}`);
        }
      }
    });
    modal.open();
  }

  /**
   * Handle switching AI provider
   */
  async handleSwitchProvider(): Promise<void> {
    const modal = new ProviderSwitchModal(
      this.app, 
      this.settingsManager,
      async (newProvider) => {
        await this.settingsManager.updateSetting('aiProvider', newProvider as any);
        await this.aiService.refreshProvider();
        new Notice(`Switched to ${this.getProviderDisplayName(newProvider)} provider`);
      }
    );
    modal.open();
  }

  /**
   * Show configuration help in file
   */
  private async showConfigurationHelpInFile(file: any, provider: string): Promise<void> {
    const currentContent = await this.app.vault.read(file);
    const providerName = this.getProviderDisplayName(provider);
    
    const helpMessage = `

> [!warning] ${providerName} Not Configured
> Please configure your AI provider in Settings:
> 1. Go to **Settings → Obsidian AI Assistant → ${providerName}**
> 2. Configure the required settings (API key, CLI path, etc.)
> 3. Try the hotkey again`;

    await this.app.vault.modify(file, currentContent + helpMessage);
  }

  /**
   * Get display name for provider
   */
  private getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
      cli: "CLI",
      anthropic: "Anthropic API",
      openai: "OpenAI API",
      openrouter: "OpenRouter API",
      ollama: "Ollama"
    };
    return names[provider] || provider;
  }
}

/**
 * Quick Question Modal for immediate AI queries
 */
class QuickQuestionModal extends Modal {
  constructor(
    app: App, 
    private onSubmit: (question: string) => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Quick AI Question" });
    
    const inputEl = contentEl.createEl("textarea", {
      attr: { placeholder: "Ask your question..." }
    });
    inputEl.style.width = "100%";
    inputEl.style.height = "100px";
    inputEl.style.marginBottom = "1rem";
    
    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "0.5rem";
    buttonContainer.style.justifyContent = "flex-end";
    
    const submitBtn = buttonContainer.createEl("button", { text: "Ask" });
    submitBtn.addEventListener("click", () => {
      this.onSubmit(inputEl.value);
      this.close();
    });
    
    const cancelBtn = buttonContainer.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    
    inputEl.focus();
    
    // Submit on Ctrl+Enter
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        this.onSubmit(inputEl.value);
        this.close();
      }
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * Provider Switch Modal for quick provider switching
 */
class ProviderSwitchModal extends Modal {
  constructor(
    app: App,
    private settingsManager: SettingsManager,
    private onSwitch: (provider: string) => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Switch AI Provider" });
    
    const settings = this.settingsManager.getSettings();
    const currentProvider = settings.aiProvider;
    
    const providers = [
      { id: "cli", name: "CLI (Command Line)", configured: Boolean(settings.aiCliPath) },
      { id: "anthropic", name: "Anthropic API", configured: Boolean(settings.anthropicApiKey) },
      { id: "openai", name: "OpenAI API", configured: Boolean(settings.openaiApiKey) },
      { id: "openrouter", name: "OpenRouter API", configured: Boolean(settings.openrouterApiKey) },
      { id: "ollama", name: "Ollama (Local)", configured: Boolean(settings.ollamaModel) }
    ];
    
    providers.forEach(provider => {
      const item = contentEl.createDiv({ cls: "provider-item" });
      item.style.padding = "0.5rem";
      item.style.border = provider.id === currentProvider ? "2px solid var(--interactive-accent)" : "1px solid var(--background-modifier-border)";
      item.style.borderRadius = "4px";
      item.style.marginBottom = "0.5rem";
      item.style.cursor = "pointer";
      
      const name = item.createEl("div", { text: provider.name });
      name.style.fontWeight = "bold";
      
      const status = item.createEl("div", { 
        text: provider.configured ? "✓ Configured" : "⚠ Not configured"
      });
      status.style.fontSize = "0.9em";
      status.style.color = provider.configured ? "var(--text-success)" : "var(--text-warning)";
      
      if (provider.id === currentProvider) {
        const current = item.createEl("div", { text: "Currently active" });
        current.style.fontSize = "0.8em";
        current.style.color = "var(--interactive-accent)";
      }
      
      item.addEventListener("click", () => {
        if (provider.configured) {
          this.onSwitch(provider.id);
          this.close();
        } else {
          new Notice(`Please configure ${provider.name} in settings first`);
        }
      });
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}