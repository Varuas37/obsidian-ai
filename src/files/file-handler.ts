/**
 * File Handler - Handles file modifications, triggers, and file-based AI interactions
 * Complete implementation with all original functionality
 */

import { App, TFile, Notice } from 'obsidian';
import { AIService } from '../core/ai-service';
import { SettingsManager } from '../settings/settings-manager';

export class FileHandler {
  private processingFiles = new Set<string>();

  constructor(
    private app: App,
    private aiService: AIService,
    private settingsManager: SettingsManager
  ) {}

  /**
   * Register file event handlers
   */
  registerEventHandlers(plugin: any): void {
    // Monitor file modifications for triggers
    plugin.registerEvent(
      this.app.vault.on("modify", (file: any) => {
        if (file instanceof TFile && file.extension === "md") {
          console.log("File modified:", file.path);
          this.handleFileModification(file);
        }
      })
    );
  }

  /**
   * Handle file modification events
   */
  async handleFileModification(file: TFile): Promise<void> {
    try {
      await this.checkForTriggers(file);
    } catch (error) {
      console.error("Error handling file modification:", error);
    }
  }

  /**
   * Check for AI triggers in file content (ai question?? pattern)
   */
  async checkForTriggers(file: TFile): Promise<void> {
    if (this.processingFiles.has(file.path)) {
      console.log("Already processing:", file.path);
      return;
    }

    try {
      const content = await this.app.vault.read(file);
      console.log("Checking for trigger in:", file.path);
      
      const settings = this.settingsManager.getSettings();
      const hasQuestion = await this.findAndProcessQuestions(file, content, settings);
      
      if (!hasQuestion) {
        console.log("No trigger found");
      }
    } catch (error) {
      console.error("Error checking triggers:", error);
    }
  }

  /**
   * Find and process questions in file content
   */
  async findAndProcessQuestions(file: TFile, content: string, settings: any): Promise<boolean> {
    const keyword = settings.triggerKeyword;
    const suffix = settings.questionSuffix;
    const questionRegex = new RegExp(`${keyword} (.+?)${suffix.replace(/\?/g, '\\?')}`, "g");
    
    let match;
    let hasQuestion = false;
    
    while ((match = questionRegex.exec(content)) !== null) {
      hasQuestion = true;
      const fullMatch = match[0];
      const question = match[1];
      
      // Check if this question has already been answered
      if (!this.isQuestionAnswered(content, fullMatch)) {
        console.log("Question found:", question);
        this.processingFiles.add(file.path);
        
        try {
          await this.answerQuestion(file, content, fullMatch, question);
        } finally {
          this.processingFiles.delete(file.path);
        }
        return hasQuestion; // Process one question at a time
      }
    }
    
    return hasQuestion;
  }

  /**
   * Check if a question has already been answered
   */
  private isQuestionAnswered(content: string, fullMatch: string): boolean {
    return content.includes(`${fullMatch}

> `);
  }

  /**
   * Answer a question found in file content
   */
  async answerQuestion(file: TFile, content: string, fullMatch: string, question: string): Promise<void> {
    try {
      const settings = this.settingsManager.getSettings();
      
      if (!this.settingsManager.isProviderConfigured()) {
        await this.showConfigurationHelp(file);
        return;
      }

      console.log("Answering question:", question);
      
      // Update file to show processing status
      const questionWithoutSuffix = fullMatch.replace(settings.questionSuffix, '');
      const contentWithThinking = content.replace(
        fullMatch, 
        `${questionWithoutSuffix}

> *Thinking...*`
      );
      
      await this.app.vault.modify(file, contentWithThinking);

      // Get AI response with file-specific context
      const response = await this.answerInlineQuestion(question, file, content);
      
      // Update file with response
      const updatedContent = await this.app.vault.read(file);
      const finalContent = updatedContent.replace(
        />\s*\*Thinking\.\.\.\*\s*\n*/g, 
        `---\n**AI Assistant**\n\n${response}\n\n---\n`
      );
      
      await this.app.vault.modify(file, finalContent);
      
      if (settings.enableNotifications) {
        new Notice("Question answered");
      }
      
    } catch (error: any) {
      console.error("AI answer error:", error);
      await this.handleAnswerError(file, error);
      new Notice(`Answer failed: ${error.message}`);
    }
  }

  /**
   * Answer an inline question with file-specific context
   */
  private async answerInlineQuestion(question: string, file: TFile, content: string): Promise<string> {
    // Create context specific to this file for inline questions
    const context = {
      activeFile: file,
      folderPath: file.parent ? file.parent.path : "/",
      vaultPath: (this.app.vault.adapter as any).basePath || "",
      vaultName: this.app.vault.getName(),
      allFolders: this.app.vault.getAllLoadedFiles()
        .filter((f: any) => f.children && Array.isArray(f.children))
        .map(f => f.path)
        .slice(0, 50)
        .join(", "),
      contextContent: content,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    };

    return await this.aiService.askQuestion(question);
  }

  /**
   * Handle errors when answering questions
   */
  private async handleAnswerError(file: TFile, error: any): Promise<void> {
    try {
      const currentContent = await this.app.vault.read(file);
      const errorContent = currentContent.replace(
        /> \*Thinking\.\.\.\*/, 
        `> *Error: ${error.message}*`
      );
      await this.app.vault.modify(file, errorContent);
    } catch (updateError) {
      console.error("Failed to update file with error:", updateError);
    }
  }

  /**
   * Show configuration help in file
   */
  private async showConfigurationHelp(file: TFile): Promise<void> {
    const currentContent = await this.app.vault.read(file);
    const settings = this.settingsManager.getSettings();
    const providerName = this.getProviderDisplayName(settings.aiProvider);
    
    const helpMessage = `

> [!warning] ${providerName} Not Configured
> Please configure your AI provider in Settings:
> 1. Go to **Settings → Obsidian AI Assistant → ${providerName}**
> 2. Configure the required settings
> 3. Ask your question again`;

    await this.app.vault.modify(file, currentContent + helpMessage);
  }

  /**
   * Process workflow for hotkey commands (with prompt.md)
   */
  async processWorkflow(file: TFile): Promise<void> {
    console.log("Processing workflow for file:", file.path);
    
    const settings = this.settingsManager.getSettings();
    
    if (!this.settingsManager.isProviderConfigured()) {
      await this.showWorkflowConfigurationHelp(file);
      return;
    }

    if (this.processingFiles.has(file.path)) {
      new Notice("AI assistant already in progress for this file");
      return;
    }

    const prompt = await this.getPromptForFile(file);
    if (!prompt) {
      await this.showNoPromptHelp(file);
      return;
    }

    console.log("Starting AI assistant workflow...");
    const content = await this.app.vault.read(file);
    const contentWithStatus = `${content}

> *Started workflow...*`;
    
    await this.app.vault.modify(file, contentWithStatus);
    
    try {
      this.processingFiles.add(file.path);
      const response = await this.processFileWorkflow(file, content, prompt);
      
      // Update file with response
      const currentContent = await this.app.vault.read(file);
      const contentWithoutStatus = currentContent.replace(/>\s*\*Started workflow\.\.\.\*\s*\n*/g, '');
      
      const updatedContent = `${contentWithoutStatus}

---
**AI Assistant**

${response}

---`;

      await this.app.vault.modify(file, updatedContent);
      
      if (settings.enableNotifications) {
        new Notice("AI assistant completed");
      }
      
    } finally {
      this.processingFiles.delete(file.path);
    }
  }

  /**
   * Get prompt file for a given file
   */
  private async getPromptForFile(file: TFile): Promise<string | null> {
    const folder = file.parent;
    if (!folder) return null;

    const promptPath = `${folder.path}/prompt.md`;
    
    if (await this.app.vault.adapter.exists(promptPath)) {
      const promptFile = this.app.vault.getAbstractFileByPath(promptPath);
      if (promptFile instanceof TFile) {
        return await this.app.vault.read(promptFile);
      }
    }
    
    return null;
  }

  /**
   * Process a workflow with custom prompt
   */
  private async processFileWorkflow(file: TFile, content: string, prompt: string): Promise<string> {
    // Use AI service to process the workflow
    const fullPrompt = `You are an Obsidian AI Assistant helping users manage their notes and knowledge base.

WORKSPACE CONTEXT:
- Vault: ${this.app.vault.getName()}
- Current folder: ${file.parent ? file.parent.path : "/"}
- Current file: ${file.path}
- Current file size: ${content.length} characters

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If the task requires destructive actions, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions

USER PROMPT:
${prompt}

CURRENT FILE CONTENT:
${content}`;

    // Create a temporary context for workflow processing
    const workflowContext = {
      activeFile: file,
      folderPath: file.parent ? file.parent.path : "/",
      vaultPath: (this.app.vault.adapter as any).basePath || "",
      vaultName: this.app.vault.getName(),
      allFolders: this.app.vault.getAllLoadedFiles()
        .filter((f: any) => f.children && Array.isArray(f.children))
        .map(f => f.path)
        .slice(0, 50)
        .join(", "),
      contextContent: content,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    };

    // Use the provider directly with the full prompt
    const provider = this.aiService.createProvider();
    return await provider.askQuestion(fullPrompt, workflowContext);
  }

  /**
   * Show workflow configuration help
   */
  private async showWorkflowConfigurationHelp(file: TFile): Promise<void> {
    const currentContent = await this.app.vault.read(file);
    const settings = this.settingsManager.getSettings();
    const providerName = this.getProviderDisplayName(settings.aiProvider);
    
    const helpMessage = `

> [!warning] ${providerName} Not Configured
> Please configure your AI provider in Settings:
> 1. Go to **Settings → Obsidian AI Assistant → ${providerName}**
> 2. Configure the required settings
> 3. Try the workflow again`;

    await this.app.vault.modify(file, currentContent + helpMessage);
  }

  /**
   * Show help when no prompt.md is found
   */
  private async showNoPromptHelp(file: TFile): Promise<void> {
    console.log("No prompt.md found in folder");
    const content = await this.app.vault.read(file);
    const settings = this.settingsManager.getSettings();
    
    const message = `> AI Assistant: No prompt.md file found in the root folder of this note. To use the AI assistant hotkey, create a prompt.md file with instructions. Or ask questions directly using: ${settings.triggerKeyword} <question>${settings.questionSuffix}`;
    
    await this.app.vault.modify(file, `${content}

${message}`);
    
    new Notice("No prompt.md found - see note for details");
  }

  /**
   * Get provider display name
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

  /**
   * Check if file is currently being processed
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
   * Clean up processing state
   */
  cleanup(): void {
    this.processingFiles.clear();
  }
}