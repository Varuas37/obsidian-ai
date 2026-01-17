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

**Happy note-taking with AI assistance! 🤖📝**