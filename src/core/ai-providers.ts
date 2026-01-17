/**
 * Complete AI Providers - All AI provider implementations with full functionality
 * Following the Strategy pattern for different AI services
 */

import { promisify } from 'util';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { PluginSettings } from '../settings/settings-manager';

const execAsync = promisify(exec);

export interface WorkspaceContext {
  activeFile: any;
  folderPath: string;
  vaultPath: string;
  vaultName: string;
  allFolders: string;
  contextContent: string;
  contentLength: number;
  timestamp: string;
  chatHistory?: any[];
}

/**
 * Base AI Provider - Abstract base class
 */
export abstract class AIProvider {
  constructor(protected settings: PluginSettings) {}
  
  abstract askQuestion(question: string, context: WorkspaceContext): Promise<string>;
  abstract isConfigured(): boolean;
  abstract getConfigurationHelp(): string;
  
  protected abstract buildPrompt(question: string, context: WorkspaceContext): string;
}

/**
 * CLI Provider - Uses command-line AI tools (COMPLETE IMPLEMENTATION)
 */
export class CLIProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    console.log("=== CLI Provider: Starting request ===");
    console.log("CLI: Question:", question);
    console.log("CLI: AI CLI Path:", this.settings.aiCliPath);
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    console.log("CLI: Building prompt...");
    const prompt = this.buildPrompt(question, context);
    
    console.log("CLI: Prompt length:", prompt.length);
    
    // Write prompt to a temporary file to handle large prompts properly
    const tempFile = join(tmpdir(), `obsidian-ai-prompt-${Date.now()}.txt`);
    
    console.log("CLI: Writing prompt to temp file:", tempFile);
    await fs.writeFile(tempFile, prompt, 'utf8');
    
    const command = `cat "${tempFile}" | ${this.settings.aiCliPath} chat --non-interactive --trust-all-tools`;
    console.log("CLI: Executing command:", command);
    
    const startTime = Date.now();
    console.log("CLI: Starting execution at", new Date().toISOString());
    
    try {
      const timeoutMs = 60000; // 60 seconds timeout
      console.log(`CLI: Setting ${timeoutMs/1000}s timeout`);
      
      const { stdout } = await execAsync(command, { 
        maxBuffer: 10 * 1024 * 1024,
        timeout: timeoutMs
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`CLI: Command completed in ${duration}s`);
      console.log("CLI: Raw output length:", stdout.length);
      
      const answer = stdout.trim()
        .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
        .replace(/\d+m> ?m/g, '')
        .replace(/\[38;5;\d+m/g, '')
        .replace(/\[0m/g, '')
        .replace(/^>\s*/gm, '')
        .trim();

      console.log("CLI: Cleaned output length:", answer.length);
      return answer;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`CLI: Execution failed after ${duration}s:`, error);
      
      if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
        throw new Error(`CLI command timed out after ${duration}s. Your AI CLI might be unresponsive or taking too long to respond.`);
      } else if (error.code === 'ENOENT') {
        throw new Error(`CLI command not found. Please check that '${this.settings.aiCliPath}' is correct and executable.`);
      } else {
        throw new Error(`CLI execution failed: ${error.message}`);
      }
    } finally {
      // Clean up temporary file
      try {
        console.log("CLI: Cleaning up temp file:", tempFile);
        await fs.unlink(tempFile);
      } catch (cleanupError) {
        console.warn("CLI: Failed to cleanup temp file:", cleanupError);
      }
    }
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.aiCliPath);
  }
  
  getConfigurationHelp(): string {
    return `⚠️ **AI CLI Not Configured**

Please configure your AI CLI path in Settings:
1. Go to **Settings → Obsidian AI Assistant → AI CLI path**
2. Find your CLI path by running: \`which <your-cli-name>\` in terminal
3. Paste the full path (e.g., \`/usr/local/bin/kiro-cli\`)`;
  }
  
  protected buildPrompt(question: string, context: WorkspaceContext): string {
    let conversationHistory = "";
    
    if (context.chatHistory && context.chatHistory.length > 0) {
      console.log("Including chat history:", context.chatHistory.length, "messages");
      conversationHistory = "\nCONVERSATION HISTORY:\n" +
        context.chatHistory
          .filter(msg => !msg.isThinking) // Exclude thinking messages
          .slice(-10) // Only keep last 10 messages to avoid overwhelming the context
          .map(msg => `${msg.type.toUpperCase()}: ${msg.content}`)
          .join('\n') + '\n';
    }

    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Vault path: ${context.vaultPath}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters
- Main folders: ${context.allFolders}

${conversationHistory}SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate
- Remember our conversation history above when responding

CURRENT QUESTION: ${question}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

Answer conversationally and helpfully, building on our previous conversation.`;
  }
}

/**
 * Anthropic Provider - Direct API access to Claude
 */
export class AnthropicProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    console.log("=== Anthropic API: Starting request ===");
    console.log("API: Question:", question);
    console.log("API: Model:", this.settings.anthropicModel);
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    console.log("API: Prompt length:", prompt.length);
    
    const startTime = Date.now();
    console.log("API: Starting request at", new Date().toISOString());
    
    try {
      const response = await this.makeRequest(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`API: Request completed in ${duration}s`);
      return response;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`API: Request failed after ${duration}s:`, error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
  
  private async makeRequest(prompt: string): Promise<string> {
    const body = {
      model: this.settings.anthropicModel,
      max_tokens: this.settings.maxTokens,
      messages: [{
        role: "user",
        content: prompt
      }]
    };
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.settings.anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.anthropicApiKey);
  }
  
  getConfigurationHelp(): string {
    return `⚠️ **Anthropic API Not Configured**

Please configure your Anthropic API key in Settings:
1. Go to **Settings → Obsidian AI Assistant → Anthropic API Key**
2. Get your API key from https://console.anthropic.com/
3. Paste your API key in the settings`;
  }
  
  protected buildPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Vault path: ${context.vaultPath}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters
- Main folders: ${context.allFolders}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate

USER QUESTION: ${question}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

Answer conversationally and helpfully, as if in a chat.`;
  }
}

/**
 * OpenAI Provider - Direct API access to GPT models
 */
export class OpenAIProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    console.log("=== OpenAI API: Starting request ===");
    console.log("API: Question:", question);
    console.log("API: Model:", this.settings.openaiModel);
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    console.log("API: Prompt length:", prompt.length);
    
    const startTime = Date.now();
    console.log("API: Starting request at", new Date().toISOString());
    
    try {
      const response = await this.makeRequest(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`API: Request completed in ${duration}s`);
      return response;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`API: Request failed after ${duration}s:`, error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  private async makeRequest(prompt: string): Promise<string> {
    const baseUrl = this.settings.apiBaseUrl || "https://api.openai.com/v1";
    const body = {
      model: this.settings.openaiModel,
      max_tokens: this.settings.maxTokens,
      messages: [{
        role: "user",
        content: prompt
      }]
    };
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.settings.openaiApiKey}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.openaiApiKey);
  }
  
  getConfigurationHelp(): string {
    return `⚠️ **OpenAI API Not Configured**

Please configure your OpenAI API key in Settings:
1. Go to **Settings → Obsidian AI Assistant → OpenAI API Key**
2. Get your API key from https://platform.openai.com/api-keys
3. Paste your API key in the settings`;
  }
  
  protected buildPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Vault path: ${context.vaultPath}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters
- Main folders: ${context.allFolders}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate

USER QUESTION: ${question}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

Answer conversationally and helpfully, as if in a chat.`;
  }
}

/**
 * OpenRouter Provider - Access to multiple models through OpenRouter
 */
export class OpenRouterProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    console.log("=== OpenRouter API: Starting request ===");
    console.log("API: Question:", question);
    console.log("API: Model:", this.settings.openrouterModel);
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    console.log("API: Prompt length:", prompt.length);
    
    const startTime = Date.now();
    console.log("API: Starting request at", new Date().toISOString());
    
    try {
      const response = await this.makeRequest(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`API: Request completed in ${duration}s`);
      return response;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`API: Request failed after ${duration}s:`, error);
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }
  
  private async makeRequest(prompt: string): Promise<string> {
    const body = {
      model: this.settings.openrouterModel,
      max_tokens: this.settings.maxTokens,
      messages: [{
        role: "user",
        content: prompt
      }]
    };
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.settings.openrouterApiKey}`,
        "HTTP-Referer": "https://obsidian.md",
        "X-Title": "Obsidian AI Assistant"
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.openrouterApiKey);
  }
  
  getConfigurationHelp(): string {
    return `⚠️ **OpenRouter API Not Configured**

Please configure your OpenRouter API key in Settings:
1. Go to **Settings → Obsidian AI Assistant → OpenRouter API Key**
2. Get your API key from https://openrouter.ai/keys
3. Paste your API key in the settings
4. Choose from 100+ AI models including GPT, Claude, Gemini, Llama, and more!`;
  }
  
  protected buildPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Vault path: ${context.vaultPath}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters
- Main folders: ${context.allFolders}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate

USER QUESTION: ${question}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

Answer conversationally and helpfully, as if in a chat.`;
  }
}

/**
 * Ollama Provider - Local AI models
 */
export class OllamaProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    console.log("=== Ollama: Starting request ===");
    console.log("Ollama: Model:", this.settings.ollamaModel);
    console.log("Ollama: URL:", this.settings.ollamaUrl);
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    console.log("Ollama: Prompt length:", prompt.length);
    
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Ollama: Request completed in ${duration}s`);
      return response;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`Ollama: Request failed after ${duration}s:`, error);
      throw new Error(`Ollama error: ${error.message}`);
    }
  }
  
  private async makeRequest(prompt: string): Promise<string> {
    const baseUrl = this.settings.ollamaUrl || "http://localhost:11434";
    
    const body = {
      model: this.settings.ollamaModel || "llama3.1",
      prompt: prompt,
      stream: false
    };
    
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data.response;
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.ollamaModel);
  }
  
  getConfigurationHelp(): string {
    return `⚠️ **Ollama Not Configured**

To use Ollama:
1. Install Ollama from https://ollama.ai/
2. Run: \`ollama pull llama3.1\` (or your preferred model)  
3. Start Ollama: \`ollama serve\`
4. Configure model name in settings

Local AI models run on your computer - no API key needed!`;
  }
  
  protected buildPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters

USER QUESTION: ${question}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

Answer conversationally and helpfully, as if in a chat.`;
  }
}