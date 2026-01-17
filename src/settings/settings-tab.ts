/**
 * Complete Settings Tab - All original functionality restored
 * Handles the plugin settings UI with full feature parity
 */

import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { SettingsManager } from './settings-manager';

export class AIObsidianSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: any,
    private settingsManager: SettingsManager
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    this.addGeneralSettings();
    this.addAIProviderSettings();
    this.addTriggerSettings();
    this.addUISettings();
    this.addAdvancedSettings();
  }

  /**
   * Add general plugin settings
   */
  private addGeneralSettings(): void {
    const { containerEl } = this;
    const settings = this.settingsManager.getSettings();

    containerEl.createEl("h3", { text: "General Settings" });

    new Setting(containerEl)
      .setName("Review directory")
      .setDesc("Where to save AI review files")
      .addText((text) => text
        .setPlaceholder("99-System/Archive/ai-reviews")
        .setValue(settings.reviewDirectory)
        .onChange(async (value) => {
          await this.settingsManager.updateSetting('reviewDirectory', value);
        }));

    new Setting(containerEl)
      .setName("Enable notifications")
      .setDesc("Show notification when AI operations complete")
      .addToggle((toggle) => toggle
        .setValue(settings.enableNotifications)
        .onChange(async (value) => {
          await this.settingsManager.updateSetting('enableNotifications', value);
        }));
  }

  /**
   * Add AI provider settings
   */
  private addAIProviderSettings(): void {
    const { containerEl } = this;
    const settings = this.settingsManager.getSettings();

    containerEl.createEl("h3", { text: "AI Provider Settings" });

    new Setting(containerEl)
      .setName("AI Provider")
      .setDesc("Choose between CLI or API providers for AI responses")
      .addDropdown((dropdown) => dropdown
        .addOption("cli", "CLI (Command Line)")
        .addOption("anthropic", "Anthropic API")
        .addOption("openai", "OpenAI API")
        .addOption("openrouter", "OpenRouter API")
        .addOption("ollama", "Ollama (Local)")
        .setValue(settings.aiProvider)
        .onChange(async (value: any) => {
          await this.settingsManager.updateSetting('aiProvider', value);
          this.display(); // Refresh to show/hide relevant options
        }));

    // CLI Settings (always show for backward compatibility)
    new Setting(containerEl)
      .setName("AI CLI path")
      .setDesc("Path to your AI CLI executable (required for CLI provider)")
      .addText((text) => text
        .setPlaceholder("/usr/local/bin/kiro-cli")
        .setValue(settings.aiCliPath)
        .onChange(async (value) => {
          await this.settingsManager.updateSetting('aiCliPath', value);
        }));

    this.addProviderSpecificSettings(settings);
  }

  /**
   * Add provider-specific settings based on selected provider
   */
  private addProviderSpecificSettings(settings: any): void {
    const { containerEl } = this;

    // Anthropic API Settings
    if (settings.aiProvider === "anthropic") {
      containerEl.createEl("h4", { text: "Anthropic Configuration" });
      
      new Setting(containerEl)
        .setName("Anthropic API Key")
        .setDesc("Your Anthropic API key from https://console.anthropic.com/")
        .addText((text) => text
          .setPlaceholder("sk-ant-...")
          .setValue(settings.anthropicApiKey)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('anthropicApiKey', value);
          }));

      new Setting(containerEl)
        .setName("Anthropic Model")
        .setDesc("Which Anthropic model to use")
        .addDropdown((dropdown) => dropdown
          .addOption("claude-sonnet-4-5", "Claude Sonnet 4.5")
          .addOption("claude-haiku-4-5", "Claude Haiku 4.5")
          .addOption("claude-opus-4-5", "Claude Opus 4.5")
          .addOption("claude-3-5-sonnet-latest", "Claude 3.5 Sonnet (Legacy)")
          .setValue(settings.anthropicModel)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('anthropicModel', value);
          }));
    }

    // OpenAI API Settings
    if (settings.aiProvider === "openai") {
      containerEl.createEl("h4", { text: "OpenAI Configuration" });
      
      new Setting(containerEl)
        .setName("OpenAI API Key")
        .setDesc("Your OpenAI API key from https://platform.openai.com/api-keys")
        .addText((text) => text
          .setPlaceholder("sk-...")
          .setValue(settings.openaiApiKey)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('openaiApiKey', value);
          }));

      new Setting(containerEl)
        .setName("OpenAI Model")
        .setDesc("Which OpenAI model to use")
        .addDropdown((dropdown) => dropdown
          .addOption("gpt-4o", "GPT-4o")
          .addOption("gpt-4o-mini", "GPT-4o Mini")
          .addOption("gpt-4", "GPT-4")
          .addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
          .setValue(settings.openaiModel)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('openaiModel', value);
          }));

      new Setting(containerEl)
        .setName("API Base URL")
        .setDesc("Custom OpenAI-compatible API endpoint (optional)")
        .addText((text) => text
          .setPlaceholder("https://api.openai.com/v1")
          .setValue(settings.apiBaseUrl || "")
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('apiBaseUrl', value);
          }));
    }

    // OpenRouter API Settings
    if (settings.aiProvider === "openrouter") {
      containerEl.createEl("h4", { text: "OpenRouter Configuration" });
      
      new Setting(containerEl)
        .setName("OpenRouter API Key")
        .setDesc("Your OpenRouter API key from https://openrouter.ai/keys")
        .addText((text) => text
          .setPlaceholder("sk-or-...")
          .setValue(settings.openrouterApiKey)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('openrouterApiKey', value);
          }));

      new Setting(containerEl)
        .setName("OpenRouter Model")
        .setDesc("Choose from 100+ AI models")
        .addDropdown((dropdown) => dropdown
          .addOption("openai/gpt-4o", "GPT-4o (OpenAI)")
          .addOption("openai/gpt-4o-mini", "GPT-4o Mini (OpenAI)")
          .addOption("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet")
          .addOption("anthropic/claude-3.5-haiku", "Claude 3.5 Haiku")
          .addOption("google/gemini-pro-1.5", "Gemini Pro 1.5")
          .addOption("meta-llama/llama-3.1-70b-instruct", "Llama 3.1 70B")
          .addOption("mistralai/mistral-large", "Mistral Large")
          .setValue(settings.openrouterModel)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('openrouterModel', value);
          }));
    }

    // Ollama Settings
    if (settings.aiProvider === "ollama") {
      containerEl.createEl("h4", { text: "Ollama Configuration" });
      
      new Setting(containerEl)
        .setName("Ollama URL")
        .setDesc("URL where Ollama is running")
        .addText((text) => text
          .setPlaceholder("http://localhost:11434")
          .setValue(settings.ollamaUrl)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('ollamaUrl', value);
          }));

      new Setting(containerEl)
        .setName("Ollama Model")
        .setDesc("Enter the exact model name you have installed (e.g., gemma2:12b, llama3.1, mistral, etc.)")
        .addText((text) => text
          .setPlaceholder("gemma3:12b")
          .setValue(settings.ollamaModel)
          .onChange(async (value) => {
            await this.settingsManager.updateSetting('ollamaModel', value);
          }));

      // Add helpful note about available models
      const helpEl = containerEl.createEl("div", {
        cls: "setting-item-description",
        attr: { style: "margin-top: 8px; padding: 20px; background: var(--background-secondary); border-radius: 6px; font-size: 0.9em; color: var(--text-muted); border-left: 3px solid var(--interactive-accent);" }
      });
      helpEl.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: 500; color: var(--text-normal);">Popular models:</div>
        <div style="margin-left: 12px; line-height: 1.4;">
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">gemma3:12b</code> - Gemma 3 12B</div>
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">llama3.1</code> - Llama 3.1 8B</div>
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">llama3.1:70b</code> - Llama 3.1 70B</div>
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">codellama</code> - Code Llama</div>
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">mistral</code> - Mistral 7B</div>
          <div>• <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">phi3</code> - Phi-3 Mini</div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--background-modifier-border); font-style: italic;">
          Run <code style="background: var(--code-background); padding: 2px 4px; border-radius: 3px; font-size: 0.85em;">ollama list</code> to see your installed models.
        </div>
      `;

    }

    // Common API Settings
    if (["anthropic", "openai", "openrouter"].includes(settings.aiProvider)) {
      new Setting(containerEl)
        .setName("Max Tokens")
        .setDesc("Maximum tokens for API responses")
        .addText((text) => text
          .setPlaceholder("4000")
          .setValue(settings.maxTokens.toString())
          .onChange(async (value) => {
            const numValue = parseInt(value) || 4000;
            await this.settingsManager.updateSetting('maxTokens', numValue);
          }));
    }
  }

  /**
   * Add trigger and file-based interaction settings
   */
  private addTriggerSettings(): void {
    const { containerEl } = this;
    const settings = this.settingsManager.getSettings();

    containerEl.createEl("h3", { text: "File Trigger Settings" });

    new Setting(containerEl)
      .setName("Trigger keyword")
      .setDesc("Keyword to trigger questions in files (e.g., 'ai what should I do??')")
      .addText((text) => text
        .setPlaceholder("ai")
        .setValue(settings.triggerKeyword)
        .onChange(async (value) => {
          await this.settingsManager.updateSetting('triggerKeyword', value);
        }));

    new Setting(containerEl)
      .setName("Question suffix")
      .setDesc("Suffix to trigger questions (e.g., '??' to avoid triggering on single '?')")
      .addText((text) => text
        .setPlaceholder("??")
        .setValue(settings.questionSuffix)
        .onChange(async (value) => {
          await this.settingsManager.updateSetting('questionSuffix', value);
        }));

  }

  /**
   * Add UI and interaction settings
   */
  private addUISettings(): void {
    const { containerEl } = this;
    const settings = this.settingsManager.getSettings();

    containerEl.createEl("h3", { text: "Interface Settings" });

    new Setting(containerEl)
      .setName("Chat panel side")
      .setDesc("Choose which sidebar to display the AI chat panel")
      .addDropdown((dropdown) => dropdown
        .addOption("left", "Left sidebar")
        .addOption("right", "Right sidebar")
        .setValue(settings.chatPanelSide)
        .onChange(async (value: any) => {
          await this.settingsManager.updateSetting('chatPanelSide', value);
          new Notice("Chat panel side changed. Restart Obsidian or reload the plugin to apply changes.");
        }));

    new Setting(containerEl)
      .setName("Chat theme")
      .setDesc("Choose the visual style for the chat interface")
      .addDropdown((dropdown) => dropdown
        .addOption("default", "Default (Obsidian)")
        .addOption("imessage", "iMessage Style")
        .addOption("minimal", "Minimal")
        .addOption("discord", "Discord Style")
        .setValue(settings.chatTheme)
        .onChange(async (value: any) => {
          await this.settingsManager.updateSetting('chatTheme', value);
          
          // Apply the new theme styles immediately
          const plugin = this.plugin as any;
          if (plugin.stylesManager) {
            const newSettings = this.settingsManager.getSettings();
            plugin.stylesManager.applySettingsBasedStyles(newSettings);
            console.log("🎨 Applied new theme:", value);
          }
          
          // Refresh the chat view to update components
          const chatViews = this.app.workspace.getLeavesOfType('ai-chat-view');
          chatViews.forEach((leaf: any) => {
            if (leaf.view && leaf.view.refresh) {
              leaf.view.refresh();
            }
          });
          
          new Notice("Chat theme changed. Changes applied immediately.");
        }));
  }

  /**
   * Add advanced settings and testing
   */
  private addAdvancedSettings(): void {
    const { containerEl } = this;

    containerEl.createEl("h3", { text: "Advanced Settings" });

    // Add a test connection button
    new Setting(containerEl)
      .setName("Test Connection")
      .setDesc("Test your current AI provider configuration")
      .addButton((button) => button
        .setButtonText("Test Connection")
        .setCta()
        .onClick(async () => {
          button.setButtonText("Testing...");
          try {
            const plugin = this.plugin as any;
            const aiService = plugin.aiService;
            if (aiService) {
              const result = await aiService.testConnection();
              if (result.success) {
                new Notice("✅ Connection successful!");
                console.log("Test response:", result.response);
              } else {
                new Notice(`❌ Connection failed: ${result.error}`);
              }
            } else {
              new Notice("❌ AI service not initialized");
            }
          } catch (error: any) {
            new Notice(`❌ Connection failed: ${error.message}`);
          } finally {
            button.setButtonText("Test Connection");
          }
        }));

    // Provider status display
    const providerInfo = containerEl.createEl("div", { cls: "ai-settings-info" });
    const settings = this.settingsManager.getSettings();
    const isConfigured = this.settingsManager.isProviderConfigured();
    
    providerInfo.innerHTML = `
      <strong>Current Provider:</strong> ${this.getProviderDisplayName(settings.aiProvider)}<br>
      <strong>Status:</strong> ${isConfigured ? '✅ Configured' : '⚠️ Not Configured'}<br>
      <strong>Chat Panel:</strong> ${settings.chatPanelSide === 'right' ? 'Right sidebar' : 'Left sidebar'}
    `;

  }

  /**
   * Get display name for provider
   */
  private getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
      cli: "CLI (Command Line)",
      anthropic: "Anthropic API",
      openai: "OpenAI API",
      openrouter: "OpenRouter API",
      ollama: "Ollama (Local)"
    };
    return names[provider] || provider;
  }
}