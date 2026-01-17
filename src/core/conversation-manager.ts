import { App } from 'obsidian';

export interface StoredMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Base conversation configuration - follows Open-Closed Principle
 */
export abstract class ConversationConfig {
  abstract readonly aiProvider: string;
  abstract readonly model: string;
  abstract readonly maxTokens: number;

  constructor(
    protected _model: string,
    protected _maxTokens: number
  ) {}

  /**
   * Serialize configuration to JSON for storage
   */
  abstract toJSON(): any;

  /**
   * Update configuration with new data (base implementation - can be overridden)
   */
  updateWith(data: any): ConversationConfig {
    // Base class doesn't need updates - return this
    return this;
  }

  /**
   * Create configuration from JSON (factory method)
   */
  static fromJSON(data: any): ConversationConfig {
    switch (data.aiProvider) {
      case 'openai':
        return OpenAIConversationConfig.fromJSON(data);
      case 'anthropic':
        return AnthropicConversationConfig.fromJSON(data);
      case 'openrouter':
        return OpenRouterConversationConfig.fromJSON(data);
      case 'ollama':
        return OllamaConversationConfig.fromJSON(data);
      case 'cli':
        return CLIConversationConfig.fromJSON(data);
      default:
        return new CLIConversationConfig(data.maxTokens || 4000);
    }
  }
}

/**
 * OpenAI-specific conversation configuration
 */
export class OpenAIConversationConfig extends ConversationConfig {
  readonly aiProvider = 'openai';
  
  constructor(
    model: string,
    maxTokens: number,
    public readonly apiType: 'responses' | 'chat-completions',
    public readonly apiBaseUrl: string,
    public lastResponseId: string | null = null
  ) {
    super(model, maxTokens);
  }

  get model(): string { return this._model; }
  get maxTokens(): number { return this._maxTokens; }

  toJSON(): any {
    return {
      aiProvider: this.aiProvider,
      model: this.model,
      maxTokens: this.maxTokens,
      apiType: this.apiType,
      apiBaseUrl: this.apiBaseUrl,
      lastResponseId: this.lastResponseId
    };
  }

  /**
   * Update OpenAI config with new data (response ID, etc.)
   */
  updateWith(data: any): OpenAIConversationConfig {
    if (data.lastResponseId !== undefined) {
      return new OpenAIConversationConfig(
        this.model,
        this.maxTokens,
        this.apiType,
        this.apiBaseUrl,
        data.lastResponseId
      );
    }
    return this;
  }

  static fromJSON(data: any): OpenAIConversationConfig {
    return new OpenAIConversationConfig(
      data.model || 'gpt-4o',
      data.maxTokens || 4000,
      data.apiType || 'responses',
      data.apiBaseUrl || 'https://api.openai.com/v1',
      data.lastResponseId || null
    );
  }
}

/**
 * Anthropic-specific conversation configuration
 */
export class AnthropicConversationConfig extends ConversationConfig {
  readonly aiProvider = 'anthropic';

  constructor(model: string, maxTokens: number) {
    super(model, maxTokens);
  }

  get model(): string { return this._model; }
  get maxTokens(): number { return this._maxTokens; }

  toJSON(): any {
    return {
      aiProvider: this.aiProvider,
      model: this.model,
      maxTokens: this.maxTokens
    };
  }

  static fromJSON(data: any): AnthropicConversationConfig {
    return new AnthropicConversationConfig(
      data.model || 'claude-sonnet-4-5',
      data.maxTokens || 4000
    );
  }
}

/**
 * OpenRouter-specific conversation configuration
 */
export class OpenRouterConversationConfig extends ConversationConfig {
  readonly aiProvider = 'openrouter';

  constructor(
    model: string,
    maxTokens: number,
    public readonly apiBaseUrl: string = 'https://openrouter.ai/api/v1'
  ) {
    super(model, maxTokens);
  }

  get model(): string { return this._model; }
  get maxTokens(): number { return this._maxTokens; }

  toJSON(): any {
    return {
      aiProvider: this.aiProvider,
      model: this.model,
      maxTokens: this.maxTokens,
      apiBaseUrl: this.apiBaseUrl
    };
  }

  static fromJSON(data: any): OpenRouterConversationConfig {
    return new OpenRouterConversationConfig(
      data.model || 'openai/gpt-4o-mini',
      data.maxTokens || 4000,
      data.apiBaseUrl || 'https://openrouter.ai/api/v1'
    );
  }
}

/**
 * Ollama-specific conversation configuration
 */
export class OllamaConversationConfig extends ConversationConfig {
  readonly aiProvider = 'ollama';

  constructor(
    model: string,
    maxTokens: number,
    public readonly ollamaUrl: string = 'http://localhost:11434'
  ) {
    super(model, maxTokens);
  }

  get model(): string { return this._model; }
  get maxTokens(): number { return this._maxTokens; }

  toJSON(): any {
    return {
      aiProvider: this.aiProvider,
      model: this.model,
      maxTokens: this.maxTokens,
      ollamaUrl: this.ollamaUrl
    };
  }

  static fromJSON(data: any): OllamaConversationConfig {
    return new OllamaConversationConfig(
      data.model || 'llama3.1',
      data.maxTokens || 4000,
      data.ollamaUrl || 'http://localhost:11434'
    );
  }
}

/**
 * CLI-specific conversation configuration
 */
export class CLIConversationConfig extends ConversationConfig {
  readonly aiProvider = 'cli';

  constructor(maxTokens: number = 4000) {
    super('CLI Tool', maxTokens);
  }

  get model(): string { return this._model; }
  get maxTokens(): number { return this._maxTokens; }

  toJSON(): any {
    return {
      aiProvider: this.aiProvider,
      model: this.model,
      maxTokens: this.maxTokens
    };
  }

  static fromJSON(data: any): CLIConversationConfig {
    return new CLIConversationConfig(data.maxTokens || 4000);
  }
}

export interface StoredConversation {
  id: string;
  name: string;
  messages: StoredMessage[];
  config: ConversationConfig; // Configuration when conversation was created
  createdAt: number;
  updatedAt: number;
  wordCount: number;
}

export interface ConversationMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  wordCount: number;
  config: ConversationConfig; // Include config in metadata for UI display
}

/**
 * Manages conversation persistence using Obsidian's data storage
 */
export class ConversationManager {
  private static instance: ConversationManager;
  private app: App;
  private conversationsPath = 'ai-assistant-conversations.json';

  constructor(app: App) {
    this.app = app;
    console.log("=== CONVERSATION MANAGER: Initialized ===");
  }

  static getInstance(app?: App): ConversationManager {
    if (!ConversationManager.instance && app) {
      ConversationManager.instance = new ConversationManager(app);
    }
    return ConversationManager.instance;
  }

  /**
   * Generate a unique conversation ID
   */
  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate word count for a conversation
   */
  private calculateWordCount(messages: StoredMessage[]): number {
    return messages.reduce((total, message) => {
      return total + message.content.trim().split(/\s+/).length;
    }, 0);
  }

  /**
   * Generate a conversation name from first few messages
   */
  private generateConversationName(messages: StoredMessage[]): string {
    if (messages.length === 0) return "Empty Conversation";
    
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
      const words = firstUserMessage.content.trim().split(/\s+/);
      const truncated = words.slice(0, 6).join(' ');
      return truncated.length < firstUserMessage.content.length ? 
        truncated + '...' : truncated;
    }
    
    return `Conversation ${new Date().toLocaleDateString()}`;
  }

  /**
   * Create configuration snapshot from current settings using factory pattern
   */
  private createConfigSnapshot(settings: any): ConversationConfig {
    const model = this.getModelForProvider(settings);
    const maxTokens = settings.maxTokens || 4000;

    switch (settings.aiProvider) {
      case 'openai':
        return new OpenAIConversationConfig(
          model,
          maxTokens,
          settings.openaiApiType || 'responses',
          settings.apiBaseUrl || 'https://api.openai.com/v1'
        );
      case 'anthropic':
        return new AnthropicConversationConfig(model, maxTokens);
      case 'openrouter':
        return new OpenRouterConversationConfig(model, maxTokens);
      case 'ollama':
        return new OllamaConversationConfig(
          model,
          maxTokens,
          settings.ollamaUrl || 'http://localhost:11434'
        );
      case 'cli':
      default:
        return new CLIConversationConfig(maxTokens);
    }
  }

  /**
   * Get model name for current provider
   */
  private getModelForProvider(settings: any): string {
    switch (settings.aiProvider) {
      case 'openai': return settings.openaiModel || 'gpt-4o';
      case 'anthropic': return settings.anthropicModel || 'claude-sonnet-4-5';
      case 'openrouter': return settings.openrouterModel || 'openai/gpt-4o-mini';
      case 'ollama': return settings.ollamaModel || 'llama3.1';
      case 'cli': return 'CLI Tool';
      default: return 'Unknown';
    }
  }

  /**
   * Check if current settings are compatible with conversation config
   */
  isConfigCompatible(conversationConfig: ConversationConfig, currentSettings: any): boolean {
    const currentConfig = this.createConfigSnapshot(currentSettings);
    
    // Base compatibility check
    if (conversationConfig.aiProvider !== currentConfig.aiProvider ||
        conversationConfig.model !== currentConfig.model) {
      return false;
    }

    // Provider-specific compatibility checks
    if (conversationConfig instanceof OpenAIConversationConfig &&
        currentConfig instanceof OpenAIConversationConfig) {
      return (
        conversationConfig.apiType === currentConfig.apiType &&
        conversationConfig.apiBaseUrl === currentConfig.apiBaseUrl
      );
    }
    
    if (conversationConfig instanceof OpenRouterConversationConfig &&
        currentConfig instanceof OpenRouterConversationConfig) {
      return conversationConfig.apiBaseUrl === currentConfig.apiBaseUrl;
    }
    
    if (conversationConfig instanceof OllamaConversationConfig &&
        currentConfig instanceof OllamaConversationConfig) {
      return conversationConfig.ollamaUrl === currentConfig.ollamaUrl;
    }

    // For Anthropic and CLI, base check is sufficient
    return true;
  }

  /**
   * Load all conversations from storage
   */
  async loadConversations(): Promise<StoredConversation[]> {
    try {
      console.log("=== CONVERSATION MANAGER: Loading conversations ===");
      const data = await this.app.vault.adapter.read(this.conversationsPath);
      const rawData = JSON.parse(data);
      
      // Convert raw JSON to proper config classes
      const conversations = rawData.map((conv: any) => ({
        ...conv,
        config: ConversationConfig.fromJSON(conv.config)
      }));
      
      console.log(`=== CONVERSATION MANAGER: Loaded ${conversations.length} conversations ===`);
      return conversations;
    } catch (error) {
      console.log("=== CONVERSATION MANAGER: No existing conversations file, returning empty array ===");
      return [];
    }
  }

  /**
   * Save conversations to storage
   */
  async saveConversations(conversations: StoredConversation[]): Promise<void> {
    try {
      console.log(`=== CONVERSATION MANAGER: Saving ${conversations.length} conversations ===`);
      const data = JSON.stringify(conversations, null, 2);
      await this.app.vault.adapter.write(this.conversationsPath, data);
      console.log("=== CONVERSATION MANAGER: Conversations saved successfully ===");
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error saving conversations:", error);
      throw new Error(`Failed to save conversations: ${error}`);
    }
  }

  /**
   * Save current conversation with configuration snapshot
   */
  async saveConversation(messages: StoredMessage[], existingId?: string, settings?: any): Promise<string> {
    try {
      const conversations = await this.loadConversations();
      const now = Date.now();
      const wordCount = this.calculateWordCount(messages);
      const conversationName = this.generateConversationName(messages);

      if (existingId) {
        // Update existing conversation
        const existingIndex = conversations.findIndex(c => c.id === existingId);
        if (existingIndex !== -1) {
          const existing = conversations[existingIndex];
          
          // let config handle its own updates
          const updatedConfig = existing.config ?
            existing.config.updateWith(settings || {}) :
            this.createConfigSnapshot(settings || {});
          
          if (updatedConfig !== existing.config) {
            console.log(`=== CONVERSATION MANAGER: Config updated for conversation ${existingId} ===`);
          }
          
          conversations[existingIndex] = {
            ...existing,
            messages,
            name: conversationName,
            updatedAt: now,
            wordCount,
            config: updatedConfig
          };
          console.log(`=== CONVERSATION MANAGER: Updated conversation ${existingId} ===`);
        } else {
          throw new Error(`Conversation with id ${existingId} not found`);
        }
      } else {
        // Create new conversation with current configuration
        const config = settings ? this.createConfigSnapshot(settings) : this.createConfigSnapshot({
          aiProvider: 'cli',
          openaiModel: 'gpt-4o',
          anthropicModel: 'claude-sonnet-4-5',
          openrouterModel: 'openai/gpt-4o-mini',
          ollamaModel: 'llama3.1',
          maxTokens: 4000
        });
        
        const newConversation: StoredConversation = {
          id: this.generateConversationId(),
          name: conversationName,
          messages,
          config: config,
          createdAt: now,
          updatedAt: now,
          wordCount
        };
        conversations.push(newConversation);
        existingId = newConversation.id;
        console.log(`=== CONVERSATION MANAGER: Created new conversation ${existingId} with config ===`);
        console.log("Config snapshot:", config);
      }

      await this.saveConversations(conversations);
      return existingId;
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error saving conversation:", error);
      throw error;
    }
  }

  /**
   * Load a specific conversation
   */
  async loadConversation(id: string): Promise<StoredConversation | null> {
    try {
      const conversations = await this.loadConversations();
      const conversation = conversations.find(c => c.id === id);
      console.log(`=== CONVERSATION MANAGER: ${conversation ? 'Found' : 'Not found'} conversation ${id} ===`);
      return conversation || null;
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error loading conversation:", error);
      return null;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    try {
      const conversations = await this.loadConversations();
      const filteredConversations = conversations.filter(c => c.id !== id);
      
      if (filteredConversations.length === conversations.length) {
        throw new Error(`Conversation with id ${id} not found`);
      }
      
      await this.saveConversations(filteredConversations);
      console.log(`=== CONVERSATION MANAGER: Deleted conversation ${id} ===`);
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error deleting conversation:", error);
      throw error;
    }
  }

  /**
   * Get conversation metadata (for history listing)
   */
  async getConversationMetadata(): Promise<ConversationMetadata[]> {
    try {
      const conversations = await this.loadConversations();
      return conversations.map(c => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c.messages.length,
        wordCount: c.wordCount,
        config: c.config
      })).sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error getting metadata:", error);
      return [];
    }
  }

  /**
   * Clear all conversations
   */
  async clearAllConversations(): Promise<void> {
    try {
      await this.saveConversations([]);
      console.log("=== CONVERSATION MANAGER: Cleared all conversations ===");
    } catch (error) {
      console.error("=== CONVERSATION MANAGER: Error clearing conversations:", error);
      throw error;
    }
  }
}