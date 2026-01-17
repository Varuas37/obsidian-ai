/**
 * AI Obsidian Plugin - Complete TypeScript + React Implementation
 * Full feature parity with original plugin + modern architecture
 */

import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import React, { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';

// Import all our modular components
import { SettingsManager } from './settings/settings-manager';
import { AIService } from './core/ai-service';
import { CommandHandler } from './commands/command-handler';
import { FileHandler } from './files/file-handler';
import { StylesManager } from './ui/styles-manager';
import { AIObsidianSettingTab } from './settings/settings-tab';
import { ReactChatView, VIEW_TYPE_AI_CHAT } from './ui/react-chat-view';

/**
 * Main Plugin Class - Complete functionality with React + TypeScript
 * Full feature parity with original plugin
 */
export default class AIObsidianPlugin extends Plugin {
  settingsManager!: SettingsManager;
  aiService!: AIService;
  stylesManager!: StylesManager;
  commandHandler!: CommandHandler;
  fileHandler!: FileHandler;

  async onload() {
    console.log("🤖 AI Obsidian Assistant - Loading complete plugin with React...");
    
    try {
      // Initialize core services
      await this.initializeCoreServices();
      
      // Initialize handlers
      await this.initializeHandlers();
      
      // Initialize UI and commands
      await this.initializeUI();
      
      console.log("✅ AI Obsidian Assistant with React - Complete functionality loaded");
      
    } catch (error) {
      console.error("❌ Failed to load AI Obsidian Assistant:", error);
      throw error;
    }
  }

  /**
   * Initialize core business services
   */
  private async initializeCoreServices(): Promise<void> {
    console.log("📋 Initializing core services...");
    
    this.settingsManager = new SettingsManager(this);
    await this.settingsManager.loadSettings();
    
    this.aiService = new AIService(this.app, this.settingsManager);
    await this.aiService.initialize();
    
    // Initialize beautiful styling
    this.stylesManager = new StylesManager();
    this.stylesManager.initializeAllStyles();
    
    console.log("✅ Core services initialized");
  }

  /**
   * Initialize event and command handlers
   */
  private async initializeHandlers(): Promise<void> {
    console.log("⚡ Initializing handlers...");
    
    this.fileHandler = new FileHandler(this.app, this.aiService, this.settingsManager);
    this.fileHandler.registerEventHandlers(this);
    
    this.commandHandler = new CommandHandler(
      this.app,
      this.aiService,
      this.settingsManager,
      this.fileHandler
    );
    this.commandHandler.registerCommands(this);
    
    console.log("✅ Handlers initialized");
  }

  /**
   * Initialize UI components
   */
  private async initializeUI(): Promise<void> {
    console.log("🎨 Initializing UI...");
    
    // Register the React chat view
    this.registerView(
      VIEW_TYPE_AI_CHAT,
      (leaf) => new ReactChatView(leaf, this.aiService, this.settingsManager)
    );

    // Add settings tab with full functionality
    this.addSettingTab(new AIObsidianSettingTab(this.app, this, this.settingsManager));

    // Initialize chat view in configured sidebar
    this.app.workspace.onLayoutReady(() => {
      this.initializeChatView();
    });
    
    console.log("✅ UI initialized");
  }

  /**
   * Activate or create the chat view
   */
  async activateChatView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_CHAT);
    
    if (existing.length) {
      this.app.workspace.revealLeaf(existing[0]);
    } else {
      const settings = this.settingsManager.getSettings();
      const isRightSide = settings.chatPanelSide === "right";
      
      const leaf = isRightSide ?
        this.app.workspace.getRightLeaf(false) :
        this.app.workspace.getLeftLeaf(false);
        
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_AI_CHAT,
          active: true
        });
      }
    }
  }

  /**
   * Initialize chat view on startup
   */
  async initializeChatView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_CHAT);
    if (existing.length === 0) {
      const settings = this.settingsManager.getSettings();
      const isRightSide = settings.chatPanelSide === "right";
      
      const leaf = isRightSide ?
        this.app.workspace.getRightLeaf(false) :
        this.app.workspace.getLeftLeaf(false);
        
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_AI_CHAT
        });
      }
    }
  }

  /**
   * Clean plugin cleanup
   */
  onunload(): void {
    console.log("🧹 Cleaning up AI Obsidian Assistant...");
    
    try {
      this.fileHandler?.cleanup();
      this.aiService?.cleanup();
      console.log("✅ AI Obsidian Assistant - Successfully unloaded");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  }

  /**
   * API method for other plugins to interact with AI service
   */
  async askAI(question: string): Promise<string> {
    if (!this.aiService) {
      throw new Error("AI service not initialized");
    }
    return await this.aiService.askQuestion(question);
  }

  /**
   * API method for other plugins to check if AI is available
   */
  isAIAvailable(): boolean {
    return this.aiService?.isConfigured() || false;
  }
}