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
  private processingFiles = new Set<string>();

  constructor(
    private app: App,
    private settingsManager: SettingsManager
  ) {}

  /**
   * Initialize the AI service
   */
  async initialize(): Promise<void> {
    await this.refreshProvider();
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
    this.currentProvider = this.createProvider();
    console.log("AI provider refreshed:", this.settingsManager.getSettings().aiProvider);
  }

  /**
   * Ask a question through the AI provider (for chat interface)
   */
  async askQuestion(question: string, chatHistory: any[] = []): Promise<string> {
    console.log("=== AI Service: Processing question ===");
    const currentSettings = this.settingsManager.getSettings();
    console.log("Provider setting:", currentSettings.aiProvider);
    console.log("Chat history length:", chatHistory.length);
    
    // Always refresh provider to ensure we're using the correct one
    await this.refreshProvider();
    
    console.log("Current provider type:", this.currentProvider?.constructor.name);

    const context = await this.gatherContext();
    const contextWithHistory = {
      ...context,
      chatHistory: chatHistory
    };
    
    return await this.currentProvider!.askQuestion(question, contextWithHistory);
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
   * Cleanup resources
   */
  cleanup(): void {
    this.processingFiles.clear();
    this.currentProvider = null;
  }
}