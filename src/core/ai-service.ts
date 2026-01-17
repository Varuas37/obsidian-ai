/**
 * AI Service - Single Responsibility Principle
 * Central service for all AI operations and provider management
 */

import { App, TFile } from 'obsidian';
import { SettingsManager, PluginSettings } from '../settings/settings-manager';
import {
  AIProvider,
  CLIProvider,
  AnthropicProvider,
  OpenAIProvider,
  OpenRouterProvider,
  OllamaProvider,
  WorkspaceContext
} from './ai-providers';

export class AIService {
  private currentProvider: AIProvider | null = null;
  private currentProviderType: string | null = null; // Track which provider type we have
  private processingFiles = new Set<string>();
  private lastResponseId: string | null = null; // Track response ID for conversation chaining

  constructor(
    private app: App,
    private settingsManager: SettingsManager
  ) {}

  /**
   * Initialize the AI service
   */
  async initialize(): Promise<void> {
    await this.refreshProvider();
    
    // Listen for provider changes and automatically refresh
    this.settingsManager.onSettingChange('aiProvider', (newProvider) => {
      console.log("=== AI SERVICE: Provider setting changed, force refreshing ===");
      console.log("New provider:", newProvider);
      // Use setTimeout to make it async without breaking the callback signature
      setTimeout(async () => {
        await this.forceRefreshProvider();
      }, 0);
    });
    
    // Also listen for other provider-related settings that might affect the current provider
    const providerRelatedSettings = ['openaiApiType', 'anthropicModel', 'openaiModel', 'ollamaModel', 'apiBaseUrl'] as const;
    providerRelatedSettings.forEach(setting => {
      this.settingsManager.onSettingChange(setting, (newValue) => {
        console.log(`=== AI SERVICE: Provider-related setting ${setting} changed, refreshing provider ===`);
        console.log("New value:", newValue);
        // Only force refresh if we already have a provider (don't create unnecessarily)
        if (this.currentProvider) {
          // Use setTimeout to make it async without breaking the callback signature
          setTimeout(async () => {
            await this.forceRefreshProvider();
          }, 0);
        }
      });
    });
  }

  /**
   * Create and return the appropriate AI provider
   */
  createProvider(): AIProvider {
    const settings = this.settingsManager.getSettings();
    console.log("🔧 Creating AI provider:", settings.aiProvider);
    console.log("🔧 Full settings object:", settings);
    
    let provider: AIProvider;
    
    switch (settings.aiProvider) {
      case "cli":
        console.log("✅ Creating CLIProvider with CLI path:", settings.aiCliPath);
        provider = new CLIProvider(settings);
        break;
      case "anthropic":
        console.log("✅ Creating AnthropicProvider");
        provider = new AnthropicProvider(settings);
        break;
      case "openai":
        console.log("✅ Creating OpenAIProvider");
        provider = new OpenAIProvider(settings);
        break;
      case "openrouter":
        console.log("✅ Creating OpenRouterProvider");
        provider = new OpenRouterProvider(settings);
        break;
      case "ollama":
        console.log("✅ Creating OllamaProvider");
        provider = new OllamaProvider(settings);
        break;
      default:
        console.warn("❌ Unknown AI provider:", settings.aiProvider);
        console.log("🔄 Falling back to CLIProvider");
        provider = new CLIProvider(settings);
    }
    
    console.log("🏭 Provider created:", provider.constructor.name);
    return provider;
  }

  /**
   * Refresh the current provider (useful after settings changes)
   */
  async refreshProvider(): Promise<void> {
    const newProviderType = this.settingsManager.getSettings().aiProvider;
    console.log("=== AI SERVICE: Refreshing provider ===");
    console.log("Previous provider type:", this.currentProviderType);
    console.log("New provider type:", newProviderType);
    
    this.currentProvider = this.createProvider();
    this.currentProviderType = newProviderType;
    console.log("AI provider refreshed to:", this.currentProviderType);
    console.log("Actual provider class:", this.currentProvider?.constructor.name);
  }

  /**
   * Force refresh the current provider (public method for settings changes)
   */
  async forceRefreshProvider(): Promise<void> {
    console.log("=== AI SERVICE: Force refreshing provider due to external settings change ===");
    this.currentProvider = null;
    this.currentProviderType = null;
    this.lastResponseId = null; // Reset conversation chain on forced refresh
    await this.refreshProvider();
  }

  /**
   * Ask a question through the AI provider (for chat interface)
   */
  async askQuestion(question: string, chatHistory: any[] = []): Promise<string> {
    console.log("=== AI Service: Processing question ===");
    const currentSettings = this.settingsManager.getSettings();
    console.log("Provider setting:", currentSettings.aiProvider);
    console.log("Chat history length:", chatHistory.length);
    
    // Check if we need to refresh provider (first time, after cleanup, or settings changed)
    const needsRefresh = !this.currentProvider || this.currentProviderType !== currentSettings.aiProvider;
    
    if (needsRefresh) {
      if (!this.currentProvider) {
        console.log("=== AI SERVICE: Creating provider (first time or after cleanup) ===");
      } else {
        console.log("=== AI SERVICE: Provider type changed ===");
        console.log("Previous provider type:", this.currentProviderType);
        console.log("New provider type:", currentSettings.aiProvider);
        // Reset conversation chain when switching providers to avoid cross-provider issues
        this.lastResponseId = null;
        console.log("=== AI SERVICE: Reset conversation chain due to provider change ===");
      }
      await this.refreshProvider();
    }
    
    console.log("Current provider type:", this.currentProvider?.constructor.name);

    const context = await this.gatherContext();
    const contextWithHistory = {
      ...context,
      chatHistory: chatHistory,
      lastResponseId: this.lastResponseId // Include response ID for conversation chaining
    };

    console.log("=== AI SERVICE: Response ID state ===");
    console.log("Current response ID:", this.lastResponseId);
    console.log("Will be passed to provider:", !!this.lastResponseId);
    
    const response = await this.currentProvider!.askQuestion(question, contextWithHistory);
    
    // Extract and store response ID for next conversation turn (OpenAI Responses API only)
    if (currentSettings.aiProvider === 'openai' && currentSettings.openaiApiType === 'responses') {
      const responseAdapter = (this.currentProvider as any).responseAdapter;
      if (responseAdapter && typeof responseAdapter.getLastResponseId === 'function') {
        const newResponseId = responseAdapter.getLastResponseId();
        if (newResponseId) {
          this.lastResponseId = newResponseId;
          console.log("=== AI SERVICE: Stored response ID for next turn ===", newResponseId);
        }
      }
    }
    
    return response;
  }

  /**
   * Gather workspace context
   */
  private async gatherContext(): Promise<WorkspaceContext> {
    const activeFile = this.app.workspace.getActiveFile();
    const folderPath = activeFile?.parent ? activeFile.parent.path : "/";
    const vaultPath = (this.app.vault.adapter as any).basePath || "";
    const vaultName = this.app.vault.getName();
    const allFolders = this.app.vault.getAllLoadedFiles()
      .filter((f: any) => f.children && Array.isArray(f.children))
      .map(f => f.path)
      .slice(0, 50)
      .join(", ");

    let contextContent = "";
    if (activeFile) {
      try {
        contextContent = await this.app.vault.read(activeFile);
      } catch (error) {
        contextContent = "Unable to read current file.";
      }
    }

    return {
      activeFile,
      folderPath,
      vaultPath,
      vaultName,
      allFolders,
      contextContent,
      contentLength: contextContent.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if the current provider is configured
   */
  isConfigured(): boolean {
    return this.settingsManager.isProviderConfigured();
  }

  /**
   * Get configuration help for the current provider
   */
  getConfigurationHelp(): string {
    if (!this.currentProvider) {
      this.refreshProvider();
    }
    return this.currentProvider?.getConfigurationHelp() || "Provider not available";
  }

  /**
   * Get current provider information
   */
  getProviderInfo() {
    const settings = this.settingsManager.getSettings();
    return {
      type: settings.aiProvider,
      configured: this.isConfigured(),
      displayName: this.getProviderDisplayName(settings.aiProvider)
    };
  }

  /**
   * Get display name for provider
   */
  private getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
      cli: "CLI",
      anthropic: "Anthropic Claude",
      openai: "OpenAI GPT",
      openrouter: "OpenRouter",
      ollama: "Ollama (Local)"
    };
    return names[provider] || provider;
  }

  /**
   * Start processing a file (prevent concurrent processing)
   */
  startProcessing(filePath: string): void {
    this.processingFiles.add(filePath);
  }

  /**
   * Stop processing a file
   */
  stopProcessing(filePath: string): void {
    this.processingFiles.delete(filePath);
  }

  /**
   * Check if a file is currently being processed
   */
  isProcessing(filePath: string): boolean {
    return this.processingFiles.has(filePath);
  }

  /**
   * Get processing status
   */
  getProcessingStatus() {
    return {
      processingCount: this.processingFiles.size,
      processingFiles: Array.from(this.processingFiles)
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      provider: this.getProviderInfo(),
      processing: this.getProcessingStatus(),
      configured: this.isConfigured()
    };
  }

  /**
   * Test provider connection
   */
  async testConnection() {
    try {
      const testQuestion = "Hello, this is a connection test. Please respond with 'Connection successful'.";
      const response = await this.askQuestion(testQuestion);
      
      return {
        success: true,
        response: response.substring(0, 100) + (response.length > 100 ? '...' : '')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Reset conversation chain (clears response ID for new conversation)
   */
  resetConversation(): void {
    this.lastResponseId = null;
    console.log("=== AI SERVICE: Conversation chain reset ===");
  }

  /**
   * Get current response ID (for debugging)
   */
  getLastResponseId(): string | null {
    return this.lastResponseId;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.processingFiles.clear();
    this.currentProvider = null;
    this.currentProviderType = null;
    this.lastResponseId = null;
  }
}