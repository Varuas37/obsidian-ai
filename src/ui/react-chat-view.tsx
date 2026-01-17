/**
 * React Chat View - Obsidian ItemView with React integration
 */

import React, { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';

import { ContextProviders } from '../react/context';
import { ChatInterface } from '../react/ChatInterface';
import { AIService } from '../core/ai-service';
import { SettingsManager } from '../settings/settings-manager';

export const VIEW_TYPE_AI_CHAT = 'ai-chat-view';

export class ReactChatView extends ItemView {
  private root: Root | null = null;
  
  constructor(
    leaf: WorkspaceLeaf,
    private aiService: AIService,
    private settingsManager: SettingsManager,
    private stylesManager?: any
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_AI_CHAT;
  }

  getDisplayText(): string {
    return 'AI Chat';
  }

  getIcon(): string {
    return 'bot';
  }

  async onOpen(): Promise<void> {
    console.log("Opening React chat view...");
    
    // Create React root and render the chat interface
    this.root = createRoot(this.contentEl);
    this.root.render(
      <StrictMode>
        <ContextProviders
          app={this.app}
          aiService={this.aiService}
          settingsManager={this.settingsManager}
        >
          <ChatInterface />
        </ContextProviders>
      </StrictMode>
    );
  }

  async onClose(): Promise<void> {
    console.log("Closing React chat view...");
    
    // Properly unmount React component
    this.root?.unmount();
    this.root = null;
  }

  /**
   * Method to refresh the chat view
   */
  refresh(): void {
    if (this.root) {
      // Force re-render with current theme as key
      const settings = this.settingsManager.getSettings();
      const themeKey = `chat-${settings.chatTheme}-${Date.now()}`;
      
      this.root.render(
        <StrictMode>
          <ContextProviders
            app={this.app}
            aiService={this.aiService}
            settingsManager={this.settingsManager}
          >
            <ChatInterface key={themeKey} />
          </ContextProviders>
        </StrictMode>
      );
    }
  }
}