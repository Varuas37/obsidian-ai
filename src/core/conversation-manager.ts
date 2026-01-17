import { App } from 'obsidian';

export interface StoredMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface StoredConversation {
  id: string;
  name: string;
  messages: StoredMessage[];
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
   * Load all conversations from storage
   */
  async loadConversations(): Promise<StoredConversation[]> {
    try {
      console.log("=== CONVERSATION MANAGER: Loading conversations ===");
      const data = await this.app.vault.adapter.read(this.conversationsPath);
      const conversations = JSON.parse(data) as StoredConversation[];
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
   * Save current conversation
   */
  async saveConversation(messages: StoredMessage[], existingId?: string): Promise<string> {
    try {
      const conversations = await this.loadConversations();
      const now = Date.now();
      const wordCount = this.calculateWordCount(messages);
      const conversationName = this.generateConversationName(messages);

      if (existingId) {
        // Update existing conversation
        const existingIndex = conversations.findIndex(c => c.id === existingId);
        if (existingIndex !== -1) {
          conversations[existingIndex] = {
            ...conversations[existingIndex],
            messages,
            name: conversationName,
            updatedAt: now,
            wordCount
          };
          console.log(`=== CONVERSATION MANAGER: Updated conversation ${existingId} ===`);
        } else {
          throw new Error(`Conversation with id ${existingId} not found`);
        }
      } else {
        // Create new conversation
        const newConversation: StoredConversation = {
          id: this.generateConversationId(),
          name: conversationName,
          messages,
          createdAt: now,
          updatedAt: now,
          wordCount
        };
        conversations.push(newConversation);
        existingId = newConversation.id;
        console.log(`=== CONVERSATION MANAGER: Created new conversation ${existingId} ===`);
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
        wordCount: c.wordCount
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