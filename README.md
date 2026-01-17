# Obsidian AI Assistant - Extensible Provider System

A powerful Obsidian plugin that provides AI assistance through multiple providers including CLI tools, direct API calls, and local AI models.

## 🚀 Features

- **Chat Interface**: Clean chat panel in left or right sidebar
- **Multiple AI Providers**: CLI, Anthropic, OpenAI, OpenRouter, Ollama
- **File-based Triggers**: Ask questions directly in your notes with `ai question??`
- **Hotkey Commands**: Quick AI assistance with customizable prompts
- **Extensible Architecture**: Easy to add new AI providers
- **Context Aware**: Automatically includes vault and file context
- **Local & Cloud**: Support for both local and cloud-based AI models

## 📋 Available Providers

### 1. **CLI Provider** (Default)
- Use any command-line AI tool (like `kiro-cli`)
- Maximum flexibility and customization
- Works with any CLI that accepts stdin prompts

### 2. **Anthropic API**
- Direct API access to Claude models
- Models: Claude 3.5 Sonnet, Haiku, Opus
- Fast responses, no CLI overhead

### 3. **OpenAI API** 
- Direct API access to GPT models
- Models: GPT-4o, GPT-4o Mini, GPT-4, GPT-3.5 Turbo
- Custom base URL for compatible services

### 4. **OpenRouter API** ⭐
- Access to **100+ AI models** through one API
- Models include: GPT, Claude, Gemini, Llama, Mistral, and more
- Single API key for multiple providers
- Great for model comparison and experimentation

### 5. **Ollama (Local)** 🏠
- Run AI models locally on your computer
- No internet required, complete privacy
- Models: Llama, Mistral, Code Llama, Phi-3, Gemma
- No API costs - free to use

## 🛠️ Setup Instructions

### Quick Start
1. Install the plugin in Obsidian
2. Go to **Settings → Obsidian AI Assistant**
3. Choose your preferred **AI Provider**
4. Configure the provider settings (API key, model, etc.)
5. Start chatting in the sidebar!

### Provider-Specific Setup

#### OpenRouter (Recommended for beginners)
1. Get API key: https://openrouter.ai/keys
2. Select **OpenRouter API** as provider
3. Enter your API key
4. Choose from 100+ models
5. ✅ Ready to chat!

#### Ollama (Best for privacy)
1. Install Ollama: https://ollama.ai/
2. Pull a model: `ollama pull llama3.1`
3. Start server: `ollama serve`
4. Select **Ollama (Local)** as provider
5. ✅ No API key needed!

#### Anthropic/OpenAI
1. Get API key from respective providers
2. Select the provider
3. Enter API key and choose model
4. ✅ Direct API access!

## 🔧 Extending with New Providers

### Adding a New Provider

The plugin uses a modular architecture that makes it easy to add new AI providers. Here's how:

#### 1. Create Your Provider Class

```javascript
class MyCustomProvider extends AIProvider {
  async askQuestion(question, context) {
    console.log("=== My Custom Provider: Starting request ===");
    
    if (!this.isConfigured()) {
      return this.getConfigurationHelp();
    }

    const prompt = this.buildPrompt(question, context);
    
    try {
      const response = await this.makeRequest(prompt);
      return response;
    } catch (error) {
      throw new Error(`Custom API error: ${error.message}`);
    }
  }
  
  async makeRequest(prompt) {
    // Implement your API call here
    const response = await fetch("YOUR_API_ENDPOINT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.settings.myCustomApiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: this.settings.maxTokens
      })
    });
    
    const data = await response.json();
    return data.response;
  }
  
  isConfigured() {
    return Boolean(this.settings.myCustomApiKey);
  }
  
  getConfigurationHelp() {
    return `⚠️ **My Custom Provider Not Configured**
    
Please configure your API key in the plugin settings.`;
  }
  
  buildPrompt(question, context) {
    return `You are an AI assistant. Question: ${question}`;
  }
}
```

#### 2. Add to Provider Factory

In `main.js`, update the `createAIProvider()` method:

```javascript
createAIProvider() {
  switch (this.settings.aiProvider) {
    // ... existing cases
    case "mycustom":
      return new MyCustomProvider(this);
    // ... rest
  }
}
```

#### 3. Add Settings UI

In the settings display method, add your provider's configuration:

```javascript
// Add to provider dropdown
dropdown.addOption("mycustom", "My Custom Provider")

// Add provider-specific settings
if (this.plugin.settings.aiProvider === "mycustom") {
  new Setting(containerEl)
    .setName("My Custom API Key")
    .setDesc("Your API key")
    .addText((text) => text
      .setValue(this.plugin.settings.myCustomApiKey)
      .onChange(async (value) => {
        this.plugin.settings.myCustomApiKey = value;
        await this.plugin.saveSettings();
      }));
}
```

#### 4. Update Default Settings

Add your new settings to `DEFAULT_SETTINGS`:

```javascript
var DEFAULT_SETTINGS = {
  // ... existing settings
  myCustomApiKey: "",
  myCustomModel: "default-model",
};
```

### Provider Templates

Check [`providers.js`](providers.js) for ready-to-use templates:

- **CustomProvider**: Basic template for any API
- **OpenRouterProvider**: Multi-model API example
- **OllamaProvider**: Local model example

## 📚 Usage Examples

### Chat Interface
- Open the chat panel (right sidebar by default)
- Type any question about your notes
- Get contextual responses with vault information

### In-Note Questions
```markdown
# My Research Notes

Some content here...

ai What are the key themes in this document??

> The response will appear here automatically
```

### Hotkey Workflows
1. Create a `prompt.md` file in your folder
2. Add instructions like: "Summarize this document and suggest next steps"
3. Use the hotkey to trigger the workflow
4. Get AI analysis appended to your note

## ⚙️ Configuration Options

- **AI Provider**: Choose your preferred AI service
- **Chat Panel Side**: Left or right sidebar
- **Trigger Keyword**: Custom keyword for in-note questions  
- **Question Suffix**: Custom suffix (default: `??`)
- **Max Tokens**: Response length limit
- **Notifications**: Enable/disable completion notifications

## 🔒 Privacy & Security

- **Local Models (Ollama)**: Complete privacy, no data leaves your computer
- **CLI Providers**: Data handled by your chosen CLI tool
- **API Providers**: Data sent to respective services (encrypted)
- **No Telemetry**: This plugin doesn't collect any usage data

## 🤝 Contributing

Want to add a new provider? 

1. Fork the repository
2. Add your provider using the templates in [`providers.js`](providers.js)
3. Update the main plugin file
4. Test thoroughly
5. Submit a pull request

Popular providers to add:
- Google Gemini API
- Cohere API
- Azure OpenAI
- Hugging Face Inference API
- Local transformers.js

## 📖 API Reference

### AIProvider Base Class

All providers extend this base class:

```javascript
class AIProvider {
  constructor(plugin) { /* ... */ }
  async askQuestion(question, context) { /* Implement this */ }
  isConfigured() { /* Check if provider is set up */ }
  getConfigurationHelp() { /* Return setup instructions */ }
  buildPrompt(question, context) { /* Format the prompt */ }
}
```

### Context Object

The context object passed to providers includes:

```javascript
{
  activeFile: TFile | null,
  folderPath: string,
  vaultPath: string, 
  vaultName: string,
  allFolders: string,
  contextContent: string,
  contentLength: number
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"Provider not configured"** - Check API keys and settings
2. **"CLI not found"** - Verify CLI path is correct and executable
3. **"Request timeout"** - Check internet connection or local service
4. **"Rate limited"** - Switch to different provider or wait

### Debug Logs

Enable debug logging in Developer Console (Ctrl+Shift+I):
- `CHAT:` - Chat interface logs
- `CLI:` - CLI provider logs  
- `API:` - API provider logs
- `Context:` - Workspace context logs

### Getting Help

1. Check the console for error messages
2. Verify your provider configuration
3. Test with a simple question first
4. Try switching providers to isolate the issue

## 📄 License

This plugin is open source. See LICENSE file for details.

---

**Happy note-taking with AI assistance! 🤖📝**