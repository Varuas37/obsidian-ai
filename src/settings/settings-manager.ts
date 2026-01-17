/**
 * Settings Manager - Single Responsibility Principle
 * Handles all plugin settings loading, saving, and validation
 */

export interface PluginSettings {
  reviewDirectory: string;
  watchedFolders: string[];
  aiCliPath: string;
  enableNotifications: boolean;
  triggerKeyword: string;
  questionSuffix: string;
  chatPanelSide: 'left' | 'right';
  chatTheme: 'default' | 'imessage' | 'minimal' | 'discord';
  aiProvider: 'cli' | 'anthropic' | 'openai' | 'openrouter' | 'ollama';
  apiProvider: string;
  anthropicApiKey: string;
  openaiApiKey: string;
  openrouterApiKey: string;
  ollamaUrl: string;
  anthropicModel: string;
  openaiModel: string;
  openrouterModel: string;
  ollamaModel: string;
  apiBaseUrl: string;
  openaiApiType: 'responses' | 'chat-completions';
  maxTokens: number;
  // Context and conversation settings
  contextWindowSize: number; // Maximum words to keep in context
  enableContextTracking: boolean;
  maxConversationHistory: number; // Maximum number of messages to keep in history
  autoSaveConversations: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  reviewDirectory: "99-System/Archive/ai-reviews",
  watchedFolders: ["04-Investigations", "08-Service", "01-Journal/Daily"],
  aiCliPath: "",
  enableNotifications: true,
  triggerKeyword: "ai",
  questionSuffix: "??",
  chatPanelSide: "right",
  chatTheme: "default",
  aiProvider: "cli",
  apiProvider: "anthropic",
  anthropicApiKey: "",
  openaiApiKey: "",
  openrouterApiKey: "",
  ollamaUrl: "http://localhost:11434",
  anthropicModel: "claude-sonnet-4-5",
  openaiModel: "gpt-4o",
  openrouterModel: "openai/gpt-4o-mini",
  ollamaModel: "gemma3:12b",
  apiBaseUrl: "https://api.openai.com/v1",
  openaiApiType: "responses",
  maxTokens: 4000,
  // Context and conversation defaults
  contextWindowSize: 100000, // 100K words max context
  enableContextTracking: true,
  maxConversationHistory: 50, // Keep last 50 messages
  autoSaveConversations: true
};

export class SettingsManager {
  private plugin: any;
  private settings: PluginSettings = DEFAULT_SETTINGS;
  private changeCallbacks: Map<keyof PluginSettings | 'any', Array<(value: any) => void>> = new Map();

  constructor(plugin: any) {
    this.plugin = plugin;
  }

  /**
   * Register a callback for when a specific setting changes
   */
  onSettingChange<K extends keyof PluginSettings>(
    key: K | 'any',
    callback: (value: PluginSettings[K] | PluginSettings) => void
  ): void {
    if (!this.changeCallbacks.has(key)) {
      this.changeCallbacks.set(key, []);
    }
    this.changeCallbacks.get(key)!.push(callback as any);
  }

  /**
   * Remove a callback for setting changes
   */
  offSettingChange<K extends keyof PluginSettings>(
    key: K | 'any',
    callback: (value: any) => void
  ): void {
    const callbacks = this.changeCallbacks.get(key);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify callbacks when a setting changes
   */
  private notifyChange<K extends keyof PluginSettings>(key: K, newValue: PluginSettings[K]): void {
    // Notify specific setting callbacks
    const specificCallbacks = this.changeCallbacks.get(key);
    if (specificCallbacks) {
      specificCallbacks.forEach(callback => {
        try {
          callback(newValue);
        } catch (error) {
          console.error(`Error in setting change callback for ${String(key)}:`, error);
        }
      });
    }

    // Notify 'any' callbacks with full settings object
    const anyCallbacks = this.changeCallbacks.get('any');
    if (anyCallbacks) {
      anyCallbacks.forEach(callback => {
        try {
          callback(this.settings);
        } catch (error) {
          console.error('Error in general setting change callback:', error);
        }
      });
    }
  }

  /**
   * Load settings from Obsidian's data storage
   */
  async loadSettings(): Promise<PluginSettings> {
    const data = await this.plugin.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    this.validateSettings();
    return this.settings;
  }

  /**
   * Save settings to Obsidian's data storage
   */
  async saveSettings(): Promise<void> {
    this.validateSettings();
    await this.plugin.saveData(this.settings);
  }

  /**
   * Get current settings
   */
  getSettings(): PluginSettings {
    return this.settings;
  }

  /**
   * Update a specific setting
   */
  async updateSetting<K extends keyof PluginSettings>(
    key: K,
    value: PluginSettings[K]
  ): Promise<void> {
    const oldValue = this.settings[key];
    this.settings[key] = value;
    
    // Only notify if the value actually changed
    if (oldValue !== value) {
      console.log(`=== SETTINGS: ${String(key)} changed from`, oldValue, 'to', value);
      this.notifyChange(key, value);
    }
    
    await this.saveSettings();
  }

  /**
   * Get a specific setting value
   */
  getSetting<K extends keyof PluginSettings>(key: K): PluginSettings[K] {
    return this.settings[key];
  }

  /**
   * Validate settings and apply defaults for invalid values
   */
  private validateSettings(): void {
    // Validate maxTokens
    if (typeof this.settings.maxTokens !== 'number' || this.settings.maxTokens < 1) {
      this.settings.maxTokens = DEFAULT_SETTINGS.maxTokens;
    }

    // Validate context window size
    if (typeof this.settings.contextWindowSize !== 'number' || this.settings.contextWindowSize < 1000) {
      this.settings.contextWindowSize = DEFAULT_SETTINGS.contextWindowSize;
    }

    // Validate max conversation history
    if (typeof this.settings.maxConversationHistory !== 'number' || this.settings.maxConversationHistory < 1) {
      this.settings.maxConversationHistory = DEFAULT_SETTINGS.maxConversationHistory;
    }

    // Validate boolean settings
    if (typeof this.settings.enableContextTracking !== 'boolean') {
      this.settings.enableContextTracking = DEFAULT_SETTINGS.enableContextTracking;
    }
    if (typeof this.settings.autoSaveConversations !== 'boolean') {
      this.settings.autoSaveConversations = DEFAULT_SETTINGS.autoSaveConversations;
    }

    // Validate chat panel side
    if (!['left', 'right'].includes(this.settings.chatPanelSide)) {
      this.settings.chatPanelSide = DEFAULT_SETTINGS.chatPanelSide;
    }

    // Validate chat theme
    const validThemes: PluginSettings['chatTheme'][] = ['default', 'imessage', 'minimal', 'discord'];
    if (!validThemes.includes(this.settings.chatTheme)) {
      this.settings.chatTheme = DEFAULT_SETTINGS.chatTheme;
    }

    // Validate AI provider
    const validProviders: PluginSettings['aiProvider'][] = ['cli', 'anthropic', 'openai', 'openrouter', 'ollama'];
    if (!validProviders.includes(this.settings.aiProvider)) {
      this.settings.aiProvider = DEFAULT_SETTINGS.aiProvider;
    }

    // Validate OpenAI API type
    const validApiTypes: PluginSettings['openaiApiType'][] = ['responses', 'chat-completions'];
    if (!validApiTypes.includes(this.settings.openaiApiType)) {
      this.settings.openaiApiType = DEFAULT_SETTINGS.openaiApiType;
    }

    // Ensure required strings are not null/undefined
    if (typeof this.settings.triggerKeyword !== 'string') {
      this.settings.triggerKeyword = DEFAULT_SETTINGS.triggerKeyword;
    }
    if (typeof this.settings.questionSuffix !== 'string') {
      this.settings.questionSuffix = DEFAULT_SETTINGS.questionSuffix;
    }
    if (typeof this.settings.reviewDirectory !== 'string') {
      this.settings.reviewDirectory = DEFAULT_SETTINGS.reviewDirectory;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
    await this.saveSettings();
  }

  /**
   * Check if a provider is properly configured
   */
  isProviderConfigured(provider?: PluginSettings['aiProvider']): boolean {
    const targetProvider = provider || this.settings.aiProvider;
    
    switch (targetProvider) {
      case 'cli':
        return Boolean(this.settings.aiCliPath);
      case 'anthropic':
        return Boolean(this.settings.anthropicApiKey);
      case 'openai':
        return Boolean(this.settings.openaiApiKey);
      case 'openrouter':
        return Boolean(this.settings.openrouterApiKey);
      case 'ollama':
        return Boolean(this.settings.ollamaModel);
      default:
        return false;
    }
  }

  /**
   * Get provider-specific configuration
   */
  getProviderConfig(provider?: PluginSettings['aiProvider']): any {
    const targetProvider = provider || this.settings.aiProvider;
    
    const configs: Record<string, any> = {
      cli: {
        path: this.settings.aiCliPath
      },
      anthropic: {
        apiKey: this.settings.anthropicApiKey,
        model: this.settings.anthropicModel,
        maxTokens: this.settings.maxTokens
      },
      openai: {
        apiKey: this.settings.openaiApiKey,
        model: this.settings.openaiModel,
        baseUrl: this.settings.apiBaseUrl,
        apiType: this.settings.openaiApiType,
        maxTokens: this.settings.maxTokens
      },
      openrouter: {
        apiKey: this.settings.openrouterApiKey,
        model: this.settings.openrouterModel,
        maxTokens: this.settings.maxTokens
      },
      ollama: {
        url: this.settings.ollamaUrl,
        model: this.settings.ollamaModel
      }
    };

    return configs[targetProvider] || {};
  }
}