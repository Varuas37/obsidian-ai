/**
 * SOLID-Compliant AI Providers - Refactored Architecture
 * 
 * This file implements a SOLID-compliant provider system that eliminates DRY violations
 * and follows all five SOLID principles for maintainable, extensible code.
 */

import { promisify } from 'util';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { requestUrl } from 'obsidian';

import { PluginSettings } from '../settings/settings-manager';

const execAsync = promisify(exec);

// ============================================================================
// CORE INTERFACES (Interface Segregation Principle)
// ============================================================================

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
  lastResponseId?: string | null; // For OpenAI Responses API conversation chaining
}

/**
 * Core provider interface - minimal, focused responsibility
 */
export interface AIProvider {
  askQuestion(question: string, context: WorkspaceContext): Promise<string>;
  isConfigured(): boolean;
  getConfigurationHelp(): string;
}

/**
 * Prompt building interface - Single Responsibility
 */
export interface PromptBuilder {
  buildPrompt(question: string, context: WorkspaceContext): string | PromptStructure;
}

/**
 * HTTP request execution interface - Single Responsibility
 */
export interface RequestExecutor {
  executeRequest(prompt: string | PromptStructure, context?: WorkspaceContext): Promise<any>;
}

/**
 * Response parsing interface - Single Responsibility  
 */
export interface ResponseAdapter {
  adaptResponse(rawResponse: any): string;
}

/**
 * Error handling interface - Single Responsibility
 */
export interface ErrorHandler {
  handleError(error: any, context: string): Error;
}

/**
 * Configuration validation interface
 */
export interface ConfigurationValidator {
  isConfigured(): boolean;
  getConfigurationHelp(): string;
}

/**
 * Structured prompt for providers that need system/user separation
 */
export interface PromptStructure {
  system: string;
  user: string;
}

// ============================================================================
// SHARED SERVICES (DRY Principle Elimination)
// ============================================================================

/**
 * Centralized prompt building service
 * Eliminates duplication across all providers
 */
export class StandardPromptBuilder implements PromptBuilder {
  buildPrompt(question: string, context: WorkspaceContext): string {
    let conversationHistory = "";
    
    if (context.chatHistory && context.chatHistory.length > 0) {
      console.log("=== PROMPT_BUILDER: Including chat history ===", context.chatHistory.length, "messages");
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
 * OpenAI Responses API optimized prompt builder
 * Skips manual history when using previous_response_id for maximum efficiency
 */
export class OpenAIResponsesPromptBuilder implements PromptBuilder {
  buildPrompt(question: string, context: WorkspaceContext): string {
    // When we have a response ID, OpenAI handles conversation context
    // No need to include manual chat history - this saves 40-80% tokens!
    if (context.lastResponseId) {
      console.log("=== OPENAI_RESPONSES_PROMPT_BUILDER: Using efficient chaining (no manual history) ===");
      return this.buildOptimizedPrompt(question, context);
    }

    // For new conversations, include some context but no chat history
    console.log("=== OPENAI_RESPONSES_PROMPT_BUILDER: New conversation (no response ID) ===");
    return this.buildNewConversationPrompt(question, context);
  }

  private buildOptimizedPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant. Continue our conversation naturally.

CURRENT WORKSPACE:
- Vault: ${context.vaultName}
- File: ${context.activeFile ? context.activeFile.path : "None"}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : ""}

USER QUESTION: ${question}`;
  }

  private buildNewConversationPrompt(question: string, context: WorkspaceContext): string {
    return `You are an Obsidian AI Assistant helping users manage their notes and knowledge base.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Main folders: ${context.allFolders}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file open."}

SAFETY RULES:
- NEVER perform destructive actions without explicit confirmation
- Be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate

USER QUESTION: ${question}`;
  }
}

/**
 * Anthropic-specific prompt builder (system/user separation)
 */
export class AnthropicPromptBuilder implements PromptBuilder {
  buildPrompt(question: string, context: WorkspaceContext): PromptStructure {
    const systemPrompt = `You are an Obsidian AI Assistant helping users manage their notes and knowledge base through a chat interface.

WORKSPACE CONTEXT:
- Vault: ${context.vaultName}
- Vault path: ${context.vaultPath}
- Current folder: ${context.folderPath}
- Current file: ${context.activeFile ? context.activeFile.path : "None"}
- Current file size: ${context.contentLength} characters
- Main folders: ${context.allFolders}

${context.contextContent ? `CURRENT FILE CONTENT:\n${context.contextContent}` : "No active file currently open."}

SAFETY RULES:
- NEVER perform destructive actions (delete, remove, overwrite files) without explicit user confirmation
- If user asks to delete/remove something, respond with: "I can help with that, but please confirm: Do you want me to [action]? Reply 'yes' to proceed."
- Always be helpful and provide context-aware suggestions
- Format responses clearly with markdown when appropriate

Answer conversationally and helpfully, as if in a chat.`;

    return {
      system: systemPrompt,
      user: question
    };
  }
}

/**
 * Centralized request execution with timing and logging
 * Eliminates duplication of logging/timing logic across providers
 */
export class TimedRequestExecutor implements RequestExecutor {
  constructor(
    private providerName: string,
    private executeFn: (prompt: string | PromptStructure, context?: WorkspaceContext) => Promise<any>
  ) {}

  async executeRequest(prompt: string | PromptStructure, context?: WorkspaceContext): Promise<any> {
    console.log(`=== ${this.providerName}: Starting request ===`);
    
    if (typeof prompt === 'string') {
      console.log(`${this.providerName}: Prompt length:`, prompt.length);
    } else {
      console.log(`${this.providerName}: System prompt length:`, prompt.system.length);
      console.log(`${this.providerName}: User prompt length:`, prompt.user.length);
    }
    
    const startTime = Date.now();
    console.log(`${this.providerName}: Starting request at`, new Date().toISOString());
    
    try {
      const response = await this.executeFn(prompt, context);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`${this.providerName}: Request completed in ${duration}s`);
      return response;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`${this.providerName}: Request failed after ${duration}s:`, error);
      throw error;
    }
  }
}

/**
 * Centralized error handling
 * Eliminates duplication of error handling patterns
 */
export class StandardErrorHandler implements ErrorHandler {
  constructor(private providerName: string) {}

  handleError(error: any, context: string): Error {
    console.error(`=== ${this.providerName}: Error Handler ===`, context, error);
    
    // Handle our enhanced Anthropic error objects with detailed information
    if (error && typeof error === 'object' && error.anthropicError) {
      console.error(`=== ${this.providerName}: Processing enhanced Anthropic error ===`);
      console.error(`Status:`, error.status);
      console.error(`Headers:`, error.headers);
      console.error(`JSON Response:`, error.json);
      console.error(`Text Response:`, error.text);
      console.error(`Original Error:`, error.originalError);
      
      // Try to extract the actual Anthropic API error details
      let anthropicErrorMessage = '';
      
      if (error.json && typeof error.json === 'object') {
        console.error(`=== ${this.providerName}: Parsing Anthropic error JSON ===`);
        
        // Anthropic API error format: { "error": { "type": "...", "message": "..." } }
        if (error.json.error) {
          const apiError = error.json.error;
          anthropicErrorMessage = `${apiError.type || 'API Error'}: ${apiError.message || 'Unknown error'}`;
          console.error(`=== ${this.providerName}: Extracted API error:`, anthropicErrorMessage);
        } else {
          // Fallback to full JSON if structure is different
          anthropicErrorMessage = JSON.stringify(error.json);
          console.error(`=== ${this.providerName}: Using full JSON as error:`, anthropicErrorMessage);
        }
      } else if (error.text && typeof error.text === 'string') {
        anthropicErrorMessage = error.text;
        console.error(`=== ${this.providerName}: Using text response as error:`, anthropicErrorMessage);
      } else {
        anthropicErrorMessage = error.message || 'Unknown error from Anthropic API';
        console.error(`=== ${this.providerName}: Using fallback error message:`, anthropicErrorMessage);
      }
      
      // Format user-friendly error messages based on status
      const status = error.status;
      switch (status) {
        case 400:
          return new Error(`${this.providerName} API 400 Error - Bad Request\n\nDetails from Anthropic: ${anthropicErrorMessage}\n\nThis usually means there's an issue with the request format, model parameters, or content.`);
        case 401:
          return new Error(`${this.providerName} API 401 Error - Authentication Failed\n\nDetails: ${anthropicErrorMessage}\n\nPlease check your API key in settings. Get a valid key from https://console.anthropic.com/`);
        case 403:
          return new Error(`${this.providerName} API 403 Error - Forbidden\n\nDetails: ${anthropicErrorMessage}\n\nThis could be due to account restrictions or policy violations.`);
        case 429:
          return new Error(`${this.providerName} API 429 Error - Rate Limited\n\nDetails: ${anthropicErrorMessage}\n\nYou've exceeded the rate limit. Please wait a moment before trying again.`);
        case 500:
        case 502:
        case 503:
        case 504:
          return new Error(`${this.providerName} API ${status} Error - Server Error\n\nDetails: ${anthropicErrorMessage}\n\nAnthropic's servers are experiencing issues. Please try again later.`);
        default:
          return new Error(`${this.providerName} API ${status} Error\n\nDetails: ${anthropicErrorMessage}`);
      }
    }
    
    // Handle standard HTTP errors (from other providers or basic response objects)
    if (error && typeof error === 'object' && error.status) {
      console.error(`${this.providerName}: Standard HTTP error - Status:`, error.status);
      console.error(`${this.providerName}: Error response:`, error.json || error.text);
      
      const errorData = error.json || {};
      const errorText = error.text || JSON.stringify(errorData);
      
      switch (error.status) {
        case 400:
          return new Error(`${this.providerName} API 400 Error - Invalid request format. Details: ${errorText}`);
        case 401:
          return new Error(`${this.providerName} API 401 Error - Invalid API key. Please check your API key in settings.`);
        case 429:
          return new Error(`${this.providerName} API 429 Error - Rate limit exceeded. Please try again later.`);
        default:
          return new Error(`${this.providerName} API ${error.status} Error: ${errorText}`);
      }
    }
    
    // Handle network errors
    if (error.message?.includes('Failed to fetch')) {
      return new Error(`Network error: Unable to connect to ${this.providerName} API. Please check your internet connection and API key.`);
    }
    
    // Handle timeouts
    if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
      return new Error(`${this.providerName} command timed out. The service might be unresponsive or taking too long to respond.`);
    }
    
    // Handle command not found
    if (error.code === 'ENOENT') {
      return new Error(`${this.providerName} command not found. Please check your configuration.`);
    }
    
    // Default error
    return new Error(`${this.providerName} error: ${error.message || error}`);
  }
}

// ============================================================================
// RESPONSE ADAPTERS (Liskov Substitution Principle)
// ============================================================================

/**
 * Anthropic API response adapter
 * Normalizes Anthropic's content[0].text format
 */
export class AnthropicResponseAdapter implements ResponseAdapter {
  adaptResponse(rawResponse: any): string {
    console.log("=== ANTHROPIC_ADAPTER: Processing response ===");
    console.log("Response structure:", rawResponse);
    
    if (!rawResponse || !rawResponse.content || !rawResponse.content[0] || !rawResponse.content[0].text) {
      console.error("Invalid Anthropic response structure:", rawResponse);
      throw new Error("Invalid response structure from Anthropic API");
    }
    
    return rawResponse.content[0].text;
  }
}

/**
 * OpenAI/OpenRouter API response adapter
 * Normalizes OpenAI's choices[0].message.content format
 */
export class OpenAIResponseAdapter implements ResponseAdapter {
  adaptResponse(rawResponse: any): string {
    console.log("=== OPENAI_ADAPTER: Processing response ===");
    console.log("Response structure:", rawResponse);
    
    if (!rawResponse || !rawResponse.choices || !rawResponse.choices[0] || 
        !rawResponse.choices[0].message || !rawResponse.choices[0].message.content) {
      console.error("Invalid OpenAI response structure:", rawResponse);
      throw new Error("Invalid response structure from OpenAI API");
    }
    
    return rawResponse.choices[0].message.content;
  }
}

/**
 * Ollama API response adapter
 * Normalizes Ollama's response format
 */
export class OllamaResponseAdapter implements ResponseAdapter {
  adaptResponse(rawResponse: any): string {
    console.log("=== OLLAMA_ADAPTER: Processing response ===");
    console.log("Response structure:", rawResponse);
    
    if (!rawResponse || !rawResponse.response) {
      console.error("Invalid Ollama response structure:", rawResponse);
      throw new Error("Invalid response structure from Ollama API");
    }
    
    return rawResponse.response;
  }
}

/**
 * OpenAI Responses API response adapter
 * Normalizes OpenAI's new Responses API output format and captures response ID
 */
export class OpenAIResponsesAdapter implements ResponseAdapter {
  private lastResponseId: string | null = null;

  adaptResponse(rawResponse: any): string {
    console.log("=== OPENAI_RESPONSES_ADAPTER: Processing response ===");
    console.log("Response structure:", rawResponse);
    
    if (!rawResponse || !rawResponse.output || !Array.isArray(rawResponse.output)) {
      console.error("Invalid OpenAI Responses API structure:", rawResponse);
      throw new Error("Invalid response structure from OpenAI Responses API");
    }
    
    // Capture response ID for conversation chaining
    if (rawResponse.id) {
      this.lastResponseId = rawResponse.id;
      console.log("OpenAI Responses: Captured response ID for next conversation turn:", this.lastResponseId);
    }
    
    // Find the message item in the output array
    const messageItem = rawResponse.output.find((item: any) => item.type === 'message');
    if (!messageItem) {
      console.error("No message item found in response:", rawResponse.output);
      throw new Error("No message found in OpenAI Responses API output");
    }
    
    // Extract text from the message content
    if (!messageItem.content || !Array.isArray(messageItem.content)) {
      console.error("Invalid message content structure:", messageItem);
      throw new Error("Invalid message content in OpenAI Responses API");
    }
    
    // Find the output_text content
    const textContent = messageItem.content.find((content: any) => content.type === 'output_text');
    if (!textContent || !textContent.text) {
      console.error("No text content found:", messageItem.content);
      throw new Error("No text content found in OpenAI Responses API message");
    }
    
    return textContent.text;
  }

  getLastResponseId(): string | null {
    return this.lastResponseId;
  }
}

/**
 * CLI response adapter
 * Normalizes CLI output by cleaning ANSI codes
 */
export class CLIResponseAdapter implements ResponseAdapter {
  adaptResponse(rawResponse: string): string {
    console.log("=== CLI_ADAPTER: Processing response ===");
    console.log("Raw output length:", rawResponse.length);
    
    const cleanedOutput = rawResponse.trim()
      .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
      .replace(/\d+m> ?m/g, '')
      .replace(/\[38;5;\d+m/g, '')
      .replace(/\[0m/g, '')
      .replace(/^>\s*/gm, '')
      .trim();
    
    console.log("Cleaned output length:", cleanedOutput.length);
    return cleanedOutput;
  }
}

// ============================================================================
// BASE PROVIDER CLASS (Template Method Pattern)
// ============================================================================

/**
 * Abstract base provider implementing the Template Method pattern
 * Eliminates duplication while maintaining flexibility
 */
export abstract class BaseAIProvider implements AIProvider {
  protected promptBuilder: PromptBuilder;
  protected requestExecutor: RequestExecutor;
  protected responseAdapter: ResponseAdapter;
  protected errorHandler: ErrorHandler;

  constructor(
    protected settings: PluginSettings,
    protected providerName: string
  ) {
    this.promptBuilder = this.createPromptBuilder();
    this.responseAdapter = this.createResponseAdapter();
    this.errorHandler = this.createErrorHandler();
    this.requestExecutor = this.createRequestExecutor();
  }

  /**
   * Template method - defines the algorithm structure
   * This eliminates the repeated askQuestion logic across all providers
   */
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    try {
      if (!this.isConfigured()) {
        return this.getConfigurationHelp();
      }

      const prompt = this.promptBuilder.buildPrompt(question, context);
      const rawResponse = await this.requestExecutor.executeRequest(prompt, context);
      return this.responseAdapter.adaptResponse(rawResponse);
    } catch (error: any) {
      throw this.errorHandler.handleError(error, 'askQuestion');
    }
  }

  // Factory methods for dependency injection (must be implemented by subclasses)
  protected abstract createPromptBuilder(): PromptBuilder;
  protected abstract createResponseAdapter(): ResponseAdapter;
  protected abstract createRequestExecutor(): RequestExecutor;
  
  protected createErrorHandler(): ErrorHandler {
    return new StandardErrorHandler(this.providerName);
  }

  // Configuration methods (must be implemented by subclasses)
  abstract isConfigured(): boolean;
  abstract getConfigurationHelp(): string;
}

// ============================================================================
// REFACTORED PROVIDER IMPLEMENTATIONS
// ============================================================================

/**
 * CLI Provider - Now follows SOLID principles with minimal code
 */
export class CLIProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    super(settings, 'CLI');
  }

  protected createPromptBuilder(): PromptBuilder {
    return new StandardPromptBuilder();
  }

  protected createResponseAdapter(): ResponseAdapter {
    return new CLIResponseAdapter();
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure) => {
      // Write prompt to a temporary file to handle large prompts properly
      const tempFile = join(tmpdir(), `obsidian-ai-prompt-${Date.now()}.txt`);
      
      console.log("CLI: Writing prompt to temp file:", tempFile);
      await fs.writeFile(tempFile, prompt as string, 'utf8');
      
      const command = `cat "${tempFile}" | ${this.settings.aiCliPath} chat --non-interactive --trust-all-tools`;
      console.log("CLI: Executing command:", command);
      
      try {
        const timeoutMs = 60000; // 60 seconds timeout
        console.log(`CLI: Setting ${timeoutMs/1000}s timeout`);
        
        const { stdout } = await execAsync(command, {
          maxBuffer: 10 * 1024 * 1024,
          timeout: timeoutMs
        });
        
        return stdout;
      } finally {
        // Clean up temporary file
        try {
          console.log("CLI: Cleaning up temp file:", tempFile);
          await fs.unlink(tempFile);
        } catch (cleanupError) {
          console.warn("CLI: Failed to cleanup temp file:", cleanupError);
        }
      }
    });
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
}

/**
 * Anthropic Provider - Minimal implementation using shared services
 */
export class AnthropicProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    super(settings, 'Anthropic API');
  }

  protected createPromptBuilder(): PromptBuilder {
    return new AnthropicPromptBuilder();
  }

  protected createResponseAdapter(): ResponseAdapter {
    return new AnthropicResponseAdapter();
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure) => {
      const structuredPrompt = prompt as PromptStructure;
      
      // IMPORTANT: Trim and validate API key
      const apiKey = this.settings.anthropicApiKey?.trim();
      if (!apiKey) {
        throw new Error("API key is missing or empty");
      }
      
      // Log key details for debugging (safely)
      console.log("=== API KEY DEBUG ===");
      console.log("Key length:", apiKey.length);
      console.log("Key starts with:", apiKey.substring(0, 15));
      console.log("Key ends with:", apiKey.substring(apiKey.length - 5));
      console.log("Has whitespace:", /\s/.test(apiKey));
      console.log("Has newlines:", /[\r\n]/.test(apiKey));
      
      // Valid Anthropic models (as of January 2025)
      const VALID_MODELS = [
        "claude-sonnet-4-5",              // Latest Claude Sonnet 4.5 (simplified name)
        "claude-haiku-4-5",               // Latest Claude Haiku 4.5 (simplified name)
        "claude-opus-4-5",                // Latest Claude Opus 4.5 (simplified name)
        "claude-sonnet-4-5-20250929",     // Latest Claude Sonnet 4.5 (with date)
        "claude-haiku-4-5-20250929",      // Latest Claude Haiku 4.5 (with date)
        "claude-opus-4-5-20250929",       // Latest Claude Opus 4.5 (with date)
        "claude-3-5-sonnet-latest",       // Alias for latest 3.5 Sonnet
        "claude-3-opus-20240229",         // Claude 3 Opus (if still available)
        "claude-3-sonnet-20240229",       // Claude 3 Sonnet (if still available)
        "claude-3-haiku-20240307"         // Claude 3 Haiku (if still available)
      ];

      const configuredModel = this.settings.anthropicModel?.trim();
      let model = configuredModel || "claude-sonnet-4-5";  // Use simplified model name as default
      
      // Warn about potentially outdated or invalid models
      if (configuredModel) {
        if (configuredModel.includes("20241022") || configuredModel.includes("20240620")) {
          console.warn(`⚠️ Model ${configuredModel} may be deprecated. Consider using claude-sonnet-4-20250514 or claude-3-5-sonnet-latest`);
        }
        if (!VALID_MODELS.includes(configuredModel) && !configuredModel.endsWith("-latest")) {
          console.warn(`⚠️ Model ${configuredModel} may not be valid. Known working models: ${VALID_MODELS.join(", ")}`);
        }
      }
      
      const body = {
        model: model,
        max_tokens: Number(this.settings.maxTokens) || 4096,
        system: structuredPrompt.system,
        messages: [{
          role: "user",
          content: structuredPrompt.user
        }]
      };

      console.log("=== REQUEST DEBUG ===");
      console.log("URL: https://api.anthropic.com/v1/messages");
      console.log("Model:", body.model);
      console.log("Max tokens:", body.max_tokens, "type:", typeof body.max_tokens);

      const response = await requestUrl({
        url: "https://api.anthropic.com/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(body),
        throw: false  // <-- KEY: Don't throw on non-2xx, let us inspect the response
      });

      console.log("=== RESPONSE DEBUG ===");
      console.log("Status:", response.status);
      console.log("Response text:", response.text);
      console.log("Response json:", response.json);

      if (response.status < 200 || response.status >= 300) {
        const errorMessage = response.text || JSON.stringify(response.json) || "Unknown error";
        console.error("=== ANTHROPIC ERROR ===");
        console.error("Status:", response.status);
        console.error("Body:", errorMessage);
        
        const error: any = new Error(`Anthropic API ${response.status}: ${errorMessage}`);
        error.status = response.status;
        error.json = response.json;
        error.text = response.text;
        throw error;
      }

      return response.json;
    });
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
}

/**
 * OpenAI Provider - Supports both Chat Completions and Responses APIs
 */
export class OpenAIProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    const apiType = settings.openaiApiType || 'responses';
    super(settings, `OpenAI ${apiType === 'responses' ? 'Responses' : 'Chat Completions'} API`);
  }

  protected createPromptBuilder(): PromptBuilder {
    const apiType = this.settings.openaiApiType || 'responses';
    // Use optimized prompt builder for Responses API to eliminate redundant history
    if (apiType === 'responses') {
      return new OpenAIResponsesPromptBuilder();
    }
    // Use standard prompt builder for Chat Completions (needs manual history)
    return new StandardPromptBuilder();
  }

  protected createResponseAdapter(): ResponseAdapter {
    const apiType = this.settings.openaiApiType || 'responses';
    return apiType === 'responses' ? new OpenAIResponsesAdapter() : new OpenAIResponseAdapter();
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure, context?: WorkspaceContext) => {
      // IMPORTANT: Trim and validate API key
      const apiKey = this.settings.openaiApiKey?.trim();
      if (!apiKey) {
        throw new Error("OpenAI API key is missing or empty");
      }
      
      // Determine API type
      const apiType = this.settings.openaiApiType || 'responses';
      
      // Validate and construct base URL
      let baseUrl = this.settings.apiBaseUrl?.trim();
      if (!baseUrl) {
        baseUrl = "https://api.openai.com/v1";
      }
      
      // Remove trailing slashes for clean URL construction
      baseUrl = baseUrl.replace(/\/+$/, '');
      
      // Construct endpoint URL based on API type
      const endpoint = apiType === 'responses' ? 'responses' : 'chat/completions';
      const fullUrl = `${baseUrl}/${endpoint}`;
      
      console.log("=== OPENAI API REQUEST DEBUG ===");
      console.log("API Type:", apiType);
      console.log("API Key length:", apiKey.length);
      console.log("API Key starts with:", apiKey.substring(0, 7));
      console.log("Base URL:", baseUrl);
      console.log("Full URL:", fullUrl);
      console.log("Model:", this.settings.openaiModel);
      console.log("Max tokens:", this.settings.maxTokens);
      
      // Prepare request body based on API type
      let body: any;
      if (apiType === 'responses') {
        // Responses API format - supports conversation chaining
        body = {
          model: this.settings.openaiModel || "gpt-4o",
          input: prompt as string
        };
        
        // Add conversation chaining if we have a previous response ID
        if (context?.lastResponseId) {
          body.previous_response_id = context.lastResponseId;
          console.log("OpenAI Responses: Using previous_response_id for conversation continuity:", context.lastResponseId);
        } else {
          console.log("OpenAI Responses: Starting new conversation (no previous_response_id)");
        }
      } else {
        // Chat Completions API format - manually include chat history
        const messages: any[] = [{
          role: "user",
          content: prompt as string
        }];
        
        // Include chat history for Chat Completions API
        if (context?.chatHistory && context.chatHistory.length > 0) {
          console.log("OpenAI Chat Completions: Including manual chat history -", context.chatHistory.length, "messages");
          
          // Build message history manually
          const historyMessages = context.chatHistory
            .filter((msg: any) => !msg.isThinking)
            .slice(-10) // Keep last 10 messages to avoid token limits
            .map((msg: any) => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            }));
          
          // Prepend history before current message
          messages.unshift(...historyMessages);
        }
        
        body = {
          model: this.settings.openaiModel || "gpt-4o",
          max_tokens: Number(this.settings.maxTokens) || 4000,
          messages: messages
        };
      }
      
      console.log("OpenAI API: Request body prepared, size:", JSON.stringify(body).length, "bytes");
      
      const response = await requestUrl({
        url: fullUrl,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        throw: false  // <-- KEY: Don't throw on non-2xx, let us inspect the response
      });
      
      console.log("=== OPENAI API RESPONSE DEBUG ===");
      console.log("Status:", response.status);
      console.log("Response text:", response.text);
      console.log("Response json:", response.json);
      
      if (response.status < 200 || response.status >= 300) {
        console.error("=== OPENAI API ERROR ===");
        console.error("Status:", response.status);
        console.error("Response text:", response.text);
        console.error("Response json:", response.json);
        
        let errorMessage = response.text || JSON.stringify(response.json) || "Unknown error";
        
        // Check for common configuration issues and provide helpful guidance
        if (response.status === 404) {
          errorMessage = `Invalid OpenAI API configuration.

Current URL: ${fullUrl}
API Type: ${apiType}

Please check your settings:
• Base URL should be "https://api.openai.com/v1" for OpenAI
• API Type: Choose "responses" (recommended) or "chat-completions"
• For custom APIs: Ensure your base URL supports the selected API type

API Error Details: ${errorMessage}`;
        }
        
        const error: any = new Error(`OpenAI API ${response.status}: ${errorMessage}`);
        error.status = response.status;
        error.json = response.json;
        error.text = response.text;
        throw error;
      }
      
      return response.json;
    });
  }

  isConfigured(): boolean {
    return Boolean(this.settings.openaiApiKey);
  }

  getConfigurationHelp(): string {
    const apiType = this.settings.openaiApiType || 'responses';
    return `⚠️ **OpenAI API Not Configured**

Please configure your OpenAI API key in Settings:
1. Go to **Settings → Obsidian AI Assistant → OpenAI API Key**
2. Get your API key from https://platform.openai.com/api-keys
3. Paste your API key in the settings
4. Choose API Type: "${apiType}" (${apiType === 'responses' ? 'Recommended - newer, more powerful' : 'Traditional chat completions'})`;
  }
}

/**
 * OpenRouter Provider - Minimal implementation using shared services
 */
export class OpenRouterProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    super(settings, 'OpenRouter API');
  }

  protected createPromptBuilder(): PromptBuilder {
    return new StandardPromptBuilder();
  }

  protected createResponseAdapter(): ResponseAdapter {
    return new OpenAIResponseAdapter(); // Same format as OpenAI
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure) => {
      const body = {
        model: this.settings.openrouterModel,
        max_tokens: this.settings.maxTokens,
        messages: [{
          role: "user",
          content: prompt as string
        }]
      };
      
      console.log("API: Request body prepared, size:", JSON.stringify(body).length, "bytes");
      
      const response = await requestUrl({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.settings.openrouterApiKey}`,
          "HTTP-Referer": "https://obsidian.md",
          "X-Title": "Obsidian AI Assistant"
        },
        body: JSON.stringify(body)
      });
      
      console.log("API: Response received, status:", response.status);
      
      if (response.status < 200 || response.status >= 300) {
        throw response; // Let error handler deal with it
      }
      
      return response.json;
    });
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
}

/**
 * Ollama Provider - Minimal implementation using shared services
 */
export class OllamaProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    super(settings, 'Ollama');
  }

  protected createPromptBuilder(): PromptBuilder {
    return new StandardPromptBuilder();
  }

  protected createResponseAdapter(): ResponseAdapter {
    return new OllamaResponseAdapter();
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure) => {
      const baseUrl = this.settings.ollamaUrl || "http://localhost:11434";
      const body = {
        model: this.settings.ollamaModel || "llama3.1",
        prompt: prompt as string,
        stream: false
      };
      
      console.log("Ollama: Request body prepared, size:", JSON.stringify(body).length, "bytes");
      
      const response = await requestUrl({
        url: `${baseUrl}/api/generate`,
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      
      console.log("Ollama: Response received, status:", response.status);
      
      if (response.status < 200 || response.status >= 300) {
        throw response; // Let error handler deal with it
      }
      
      return response.json;
    });
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
}