// AI Provider Extensions
// Add new providers here to extend the plugin's capabilities

/**
 * OpenRouter Provider - Access to multiple AI models through OpenRouter API
 * Get your API key at: https://openrouter.ai/keys
 */
class OpenRouterProvider extends AIProvider {
  async askQuestion(question, context) {
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
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`API: Request failed after ${duration}s:`, error);
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }
  
  async makeRequest(prompt) {
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
  
  isConfigured() {
    return Boolean(this.settings.openrouterApiKey);
  }
  
  getConfigurationHelp() {
    return `⚠️ **OpenRouter API Not Configured**

Please configure your OpenRouter API key in Settings:
1. Go to **Settings → Obsidian AI Assistant → OpenRouter API Key**
2. Get your API key from https://openrouter.ai/keys
3. Paste your API key in the settings
4. Choose from 100+ AI models including GPT, Claude, Gemini, Llama, and more!`;
  }
  
  buildPrompt(question, context) {
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
 * Custom Provider Template
 * Copy this template to create your own custom provider
 */
class CustomProvider extends AIProvider {
  async askQuestion(question, context) {
    console.log("=== Custom Provider: Starting request ===");
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    
    try {
      // Add your custom API logic here
      const response = await this.makeRequest(prompt);
      return response;
    } catch (error) {
      throw new Error(`Custom API error: ${error.message}`);
    }
  }
  
  async makeRequest(prompt) {
    // Implement your custom API call here
    // Example:
    // const response = await fetch("YOUR_API_ENDPOINT", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${this.settings.customApiKey}`
    //   },
    //   body: JSON.stringify({
    //     prompt: prompt,
    //     max_tokens: this.settings.maxTokens
    //   })
    // });
    // 
    // const data = await response.json();
    // return data.response;
    
    throw new Error("Custom provider not implemented");
  }
  
  isConfigured() {
    // Check if your provider is properly configured
    return Boolean(this.settings.customApiKey);
  }
  
  getConfigurationHelp() {
    return `⚠️ **Custom Provider Not Configured**

Please configure your custom API settings in the plugin code or settings.`;
  }
  
  buildPrompt(question, context) {
    // Customize the prompt for your provider
    return `Custom prompt template for ${question}`;
  }
}

/**
 * Ollama Provider - For local AI models
 * Run local models with Ollama: https://ollama.ai/
 */
class OllamaProvider extends AIProvider {
  async askQuestion(question, context) {
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
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`Ollama: Request failed after ${duration}s:`, error);
      throw new Error(`Ollama error: ${error.message}`);
    }
  }
  
  async makeRequest(prompt) {
    const baseUrl = this.settings.ollamaUrl || "http://localhost:11434";
    
    const body = {
      model: this.settings.ollamaModel || "llama2",
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
  
  isConfigured() {
    // Ollama doesn't need API key, just needs to be running
    return Boolean(this.settings.ollamaModel);
  }
  
  getConfigurationHelp() {
    return `⚠️ **Ollama Not Configured**

To use Ollama:
1. Install Ollama from https://ollama.ai/
2. Run: \`ollama pull llama2\` (or your preferred model)  
3. Start Ollama: \`ollama serve\`
4. Configure model name in settings

Local AI models run on your computer - no API key needed!`;
  }
  
  buildPrompt(question, context) {
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

/**
 * Provider Registry
 * Add your custom providers here to make them available in the plugin
 */
const AVAILABLE_PROVIDERS = {
  cli: CLIProvider,
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  openrouter: OpenRouterProvider,
  ollama: OllamaProvider,
  // Add your custom providers here:
  // custom: CustomProvider,
};

/**
 * Provider Configuration Helper
 * Defines settings and UI for each provider
 */
const PROVIDER_CONFIGS = {
  openrouter: {
    name: "OpenRouter API",
    description: "Access to 100+ AI models through OpenRouter",
    settings: {
      apiKey: "openrouterApiKey",
      model: "openrouterModel"
    },
    models: {
      "openai/gpt-4o": "GPT-4o (OpenAI)",
      "openai/gpt-4o-mini": "GPT-4o Mini (OpenAI)", 
      "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet (Anthropic)",
      "anthropic/claude-3.5-haiku": "Claude 3.5 Haiku (Anthropic)",
      "google/gemini-pro-1.5": "Gemini Pro 1.5 (Google)",
      "meta-llama/llama-3.1-70b-instruct": "Llama 3.1 70B (Meta)",
      "mistralai/mistral-large": "Mistral Large",
      "cohere/command-r-plus": "Command R+ (Cohere)",
      "perplexity/llama-3.1-sonar-large-128k-online": "Sonar Large Online (Perplexity)"
    },
    setupUrl: "https://openrouter.ai/keys",
    setupInstructions: "Get your API key from OpenRouter and access 100+ AI models"
  },
  
  ollama: {
    name: "Ollama (Local)",
    description: "Run AI models locally on your computer",
    settings: {
      url: "ollamaUrl", 
      model: "ollamaModel"
    },
    models: {
      "llama3.1": "Llama 3.1 (8B)",
      "llama3.1:70b": "Llama 3.1 (70B)",
      "llama2": "Llama 2 (7B)",
      "codellama": "Code Llama",
      "mistral": "Mistral 7B", 
      "phi3": "Phi-3 Mini",
      "gemma2": "Gemma 2"
    },
    setupUrl: "https://ollama.ai/",
    setupInstructions: "Install Ollama locally - no API key needed!"
  }
};

// Export for use in main plugin file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVAILABLE_PROVIDERS, PROVIDER_CONFIGS, OpenRouterProvider, OllamaProvider };
}