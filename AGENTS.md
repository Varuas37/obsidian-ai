# AI Agents Guide - Obsidian AI Assistant Plugin

> **For AI Assistants working on this codebase**

## 🎯 Plugin Purpose & Context

### **What This Plugin Does**
This is an **Obsidian AI Assistant plugin** that integrates AI capabilities directly into Obsidian note-taking workflows:

1. **Chat Interface**: React-powered sidebar chat with conversation history
2. **File Triggers**: Users type `ai question??` in notes → automatic AI responses  
3. **Hotkey Workflows**: AI processes notes using custom `prompt.md` files
4. **Multiple Providers**: Supports CLI tools, OpenAI, Anthropic, OpenRouter, Ollama
5. **Context Awareness**: AI knows about vault structure, current files, note content

### **User Workflows Supported**
- **Chat**: Direct conversation with AI about notes and tasks
- **Inline Questions**: `ai what should I focus on??` → AI answers in the note
- **File Processing**: Hotkey on note → AI processes using folder's `prompt.md`
- **Quick Questions**: Modal for fast AI queries with clipboard results

## 🏗️ Current Architecture (TypeScript + React)

### **Technology Stack**
- **TypeScript**: 100% type-safe codebase
- **React 18**: Modern UI with hooks and context
- **esbuild**: Fast bundling system
- **Obsidian Plugin API**: Native Obsidian integration

### **Module Structure**
```
src/
├── main.ts                    # Plugin orchestrator (dependency injection)
├── core/                      # Business logic
│   ├── ai-service.ts          # AI operations coordinator
│   └── ai-providers.ts        # All 5 provider implementations
├── react/                     # React UI
│   ├── context.tsx            # React contexts (useAIService, useSettings, useApp)
│   ├── ChatInterface.tsx      # Main chat component with ThemeProvider integration
│   ├── themes/                # Centralized theme system (SOLID architecture)
│   │   ├── types.ts           # Theme interfaces and contracts
│   │   ├── ThemeProvider.ts   # Factory pattern theme manager
│   │   ├── index.ts           # Central theme exports
│   │   ├── default/           # Default Obsidian theme
│   │   │   ├── Bubble.tsx     # Message bubble component
│   │   │   ├── Header.tsx     # Header component
│   │   │   ├── Input.tsx      # Input component
│   │   │   └── index.ts       # Theme configuration
│   │   ├── imessage/          # iOS Messages theme
│   │   │   ├── Bubble.tsx     # iOS-style bubbles
│   │   │   ├── Header.tsx     # iOS-style header
│   │   │   ├── Input.tsx      # iOS-style input
│   │   │   └── index.ts       # Theme configuration
│   │   ├── discord/           # Discord-style theme
│   │   │   ├── Bubble.tsx     # Discord bubbles with avatars
│   │   │   ├── Header.tsx     # Discord-style header
│   │   │   ├── Input.tsx      # Discord-style input
│   │   │   └── index.ts       # Theme configuration
│   │   └── minimal/           # Minimal clean theme
│   │       ├── Bubble.tsx     # Minimal bubbles
│   │       ├── Header.tsx     # Minimal header
│   │       ├── Input.tsx      # Minimal input
│   │       └── index.ts       # Theme configuration
│   ├── themed-components/     # Legacy theme components (deprecated)
│   └── utils/                 # React utilities
│       └── AvatarGenerator.ts # Random avatar generation system
├── ui/                        # UI management
│   ├── react-chat-view.tsx    # Obsidian ItemView wrapper for React
│   └── styles-manager.ts      # Professional CSS styling + theme system
├── settings/                  # Configuration
│   ├── settings-manager.ts    # Type-safe settings with theme support
│   └── settings-tab.ts        # Complete settings UI with theme selector
├── files/                     # File operations
│   └── file-handler.ts        # File triggers, inline questions
└── commands/                  # Commands
    └── command-handler.ts     # All plugin commands + modals
```

### **Key Design Patterns**
- **Dependency Injection**: Services injected via constructors
- **Factory Pattern**: Provider creation based on settings
- **Strategy Pattern**: Swappable AI providers  
- **Observer Pattern**: Settings changes notify services
- **React Context**: Clean dependency access in components

## 🔧 Development Workflow

### **Build System**
```bash
npm install          # Install dependencies
npm run dev          # Watch mode (development)
npm run build        # Production build
```

### **File Types**
- **`.ts`**: TypeScript modules
- **`.tsx`**: React components with JSX
- **`main.js`**: Generated build output (don't edit directly)

### **Key Entry Points**
- **Plugin Start**: [`src/main.ts`](src/main.ts) - Plugin orchestrator
- **Chat UI**: [`src/react/ChatInterface.tsx`](src/react/ChatInterface.tsx) - Main React component
- **AI Logic**: [`src/core/ai-service.ts`](src/core/ai-service.ts) - AI coordination
- **Settings**: [`src/settings/settings-manager.ts`](src/settings/settings-manager.ts) - Configuration

## 🚀 How to Add New Features

### **1. Adding New AI Providers**

**Step 1**: Create provider class in [`ai-providers.ts`](src/core/ai-providers.ts)
```typescript
export class MyNewProvider extends AIProvider {
  async askQuestion(question: string, context: WorkspaceContext): Promise<string> {
    // Your implementation here
    return "AI response";
  }
  
  isConfigured(): boolean {
    return Boolean(this.settings.myNewApiKey);
  }
  
  getConfigurationHelp(): string {
    return "Setup instructions for your provider";
  }
}
```

**Step 2**: Add to factory in [`ai-service.ts`](src/core/ai-service.ts)
```typescript
case "mynew":
  return new MyNewProvider(settings);
```

**Step 3**: Add settings in [`settings-manager.ts`](src/settings/settings-manager.ts)
```typescript
interface PluginSettings {
  // ... existing
  myNewApiKey: string;
  myNewModel: string;
}

const DEFAULT_SETTINGS = {
  // ... existing  
  myNewApiKey: "",
  myNewModel: "default-model"
}
```

**Step 4**: Add UI in [`settings-tab.ts`](src/settings/settings-tab.ts)
```typescript
if (settings.aiProvider === "mynew") {
  new Setting(containerEl)
    .setName("My New API Key")
    .addText(/* ... */);
}
```

### **2. Adding New React Components**

**Create**: [`src/react/MyComponent.tsx`](src/react/)
```typescript
import React from 'react';
import { useAIService, useSettings, useApp } from './context';

export const MyComponent: React.FC = () => {
  const aiService = useAIService();
  const settings = useSettings();
  const app = useApp();
  
  return <div>My Component</div>;
};
```

**Use**: Import and use in other React components
```typescript
import { MyComponent } from './MyComponent';
```

### **3. Adding New Commands**

**Add to** [`command-handler.ts`](src/commands/command-handler.ts)
```typescript
registerCommands(plugin: any): void {
  plugin.addCommand({
    id: "my-new-command",
    name: "My New Command",
    callback: () => this.handleMyNewCommand()
  });
}

async handleMyNewCommand(): Promise<void> {
  // Your command logic
}
```

### **4. Adding New Chat Themes (SOLID Architecture)**

**Step 1**: Create theme folder structure in [`src/react/themes/mynewtheme/`](src/react/themes/)
```
mynewtheme/
├── Bubble.tsx    # Message bubble component
├── Header.tsx    # Header component
├── Input.tsx     # Input component
└── index.ts      # Theme configuration
```

**Step 2**: Create theme components following interface contracts
```typescript
// mynewtheme/Bubble.tsx
import React from 'react';
import { ChatBubbleProps } from '../types';

export function MyNewThemeBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className="your-bubble-styling">
      {message}
    </div>
  );
}

// mynewtheme/Header.tsx
import React from 'react';
import { ChatHeaderProps } from '../types';

export function MyNewThemeHeader({ name, status, onClear }: ChatHeaderProps) {
  return (
    <div className="your-header-styling">
      <span>{name}</span>
      {onClear && <button onClick={onClear}>Clear</button>}
    </div>
  );
}

// mynewtheme/Input.tsx
import React, { useState } from 'react';
import { ChatInputProps } from '../types';

export function MyNewThemeInput({ onSend, placeholder, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  // Implementation...
}
```

**Step 3**: Configure theme in [`mynewtheme/index.ts`](src/react/themes/)
```typescript
import { ThemeConfig } from '../types';
import { MyNewThemeBubble } from './Bubble';
import { MyNewThemeHeader } from './Header';
import { MyNewThemeInput } from './Input';

export const mynewTheme: ThemeConfig = {
  name: 'mynewtheme',
  displayName: 'My New Theme',
  description: 'Custom theme description',
  components: {
    Bubble: MyNewThemeBubble,
    Header: MyNewThemeHeader,
    Input: MyNewThemeInput
  }
};
```

**Step 4**: Register theme in [`ThemeProvider.ts`](src/react/themes/ThemeProvider.ts)
```typescript
import { mynewTheme } from './mynewtheme';

// Add to themes registry in constructor
this.themes = {
  // ... existing themes
  mynewtheme: mynewTheme
};
```

**Step 5**: Add settings and validation
```typescript
// Update PluginSettings interface and validation as before
```

### **5. Adding New File Operations**

**Add to** [`file-handler.ts`](src/files/file-handler.ts)
```typescript
async myNewFileOperation(file: TFile): Promise<void> {
  // Your file processing logic
  const content = await this.app.vault.read(file);
  const response = await this.aiService.askQuestion("Process this file");
  await this.app.vault.modify(file, content + response);
}
```

## 🎨 UI Development

### **Theme System Architecture**
- **Four Available Themes**: Default (Obsidian), iMessage (iOS), Minimal (Clean), Discord (Chat App)
- **Theme Components**: Modular components in [`src/react/themed-components/`](src/react/themed-components/)
- **Avatar System**: Random avatar generation in [`AvatarGenerator.ts`](src/react/utils/AvatarGenerator.ts)
- **Utility Classes**: 120+ Tailwind-like classes with `!important` overrides
- **Theme Switching**: Instant updates via Settings → Interface Settings → Chat theme

### **Styling System**
- **CSS Classes**: Managed in [`styles-manager.ts`](src/ui/styles-manager.ts)
- **Theme Variables**: Use `var(--obsidian-css-vars)` for theme compatibility
- **Utility System**: Complete Tailwind-like utility classes for themed components
- **CSS Specificity**: Uses `!important` declarations to override Obsidian's default styles
- **Responsive**: Mobile-friendly designs
- **Animations**: Smooth transitions and loading states

### **React Patterns Used**
- **Context Hooks**: `useAIService()`, `useSettings()`, `useApp()`
- **State Management**: `useState` for local state and theme tracking
- **Effects**: `useEffect` for lifecycle management and theme changes
- **Refs**: `useRef` for DOM access
- **Component Patterns**: Strategy pattern for theme-aware components

## 🔍 Important Implementation Details

### **Conversation History**
- **Location**: [`ChatInterface.tsx:87`](src/react/ChatInterface.tsx:87)
- **Format**: Last 10 messages as `USER: message` / `ASSISTANT: response`
- **Integration**: Passed to all AI providers via context

### **File Trigger Pattern**
- **Detection**: [`file-handler.ts:70`](src/files/file-handler.ts:70)
- **Regex**: `${keyword} (.+?)${suffix}` (e.g., `ai question??`)
- **Processing**: Automatic when file is saved

### **CLI Integration**
- **Temp Files**: Large prompts written to temp files
- **Execution**: [`ai-providers.ts:65`](src/core/ai-providers.ts:65)
- **Timeout**: 60-second timeout for CLI commands
- **Cleanup**: Automatic temp file removal

### **Provider Factory**
- **Location**: [`ai-service.ts:37`](src/core/ai-service.ts:37)
- **Pattern**: Switch statement based on `settings.aiProvider`
- **Debugging**: Enhanced logging for troubleshooting

## ⚠️ Critical Notes for AI Agents

### **When Making Changes**

#### **🔄 Always Update Documentation**
After implementing any feature:
1. **Update [`ARCHITECTURE.md`](ARCHITECTURE.md)** with architectural changes
2. **Update this [`AGENTS.md`](AGENTS.md)** with new development guidance  
3. **Add code examples** for new patterns introduced
4. **Update line counts** and module descriptions if structure changes

#### **🧪 Testing Requirements**
- **Build**: Always run `npm run build` to verify compilation
- **Types**: Ensure TypeScript compilation succeeds
- **Functionality**: Test new features work in Obsidian
- **Regression**: Verify existing features still work

#### **💡 Code Quality Standards**
- **Type Safety**: Use proper TypeScript types, avoid `any` when possible
- **Error Handling**: Comprehensive try/catch blocks
- **Logging**: Add debug logs with clear prefixes (`=== MODULE: action ===`)
- **Documentation**: JSDoc comments for complex functions

### **Common Pitfalls to Avoid**

#### **❌ Don't**
- **Edit `main.js`**: This is generated - edit `src/main.ts` instead
- **Break Provider Interface**: All providers must implement `AIProvider`
- **Ignore Chat History**: New providers should use `context.chatHistory`
- **Forget Cleanup**: Always implement cleanup methods
- **Mix Concerns**: Keep modules focused on single responsibilities

#### **✅ Do**
- **Follow Patterns**: Use existing patterns for consistency
- **Use Contexts**: Access services via React hooks in components
- **Add Debug Logs**: Help future debugging with clear logging
- **Test Providers**: Verify each provider works independently
- **Update Docs**: Keep documentation current

### **File Modification Guidelines**

#### **Settings Changes**
1. Update [`settings-manager.ts`](src/settings/settings-manager.ts) interface
2. Update [`settings-tab.ts`](src/settings/settings-tab.ts) UI
3. Update [`DEFAULT_SETTINGS`](src/settings/settings-manager.ts:20) object

#### **UI Changes**
1. React components: [`src/react/`](src/react/) directory
2. Styling: [`styles-manager.ts`](src/ui/styles-manager.ts)
3. View wrapper: [`react-chat-view.tsx`](src/ui/react-chat-view.tsx)

#### **AI Logic Changes**
1. Service logic: [`ai-service.ts`](src/core/ai-service.ts)
2. Provider implementations: [`ai-providers.ts`](src/core/ai-providers.ts)
3. Context handling: Update `WorkspaceContext` interface

## 🎓 Learning the Codebase

### **Start Here**
1. **[`main.ts`](src/main.ts)**: Understand plugin initialization
2. **[`ChatInterface.tsx`](src/react/ChatInterface.tsx)**: See React integration
3. **[`ai-service.ts`](src/core/ai-service.ts)**: Understand AI coordination
4. **[`settings-manager.ts`](src/settings/settings-manager.ts)**: Configuration patterns

### **Key Concepts**
- **Provider Pattern**: Swappable AI services
- **React Contexts**: Dependency injection for React
- **Conversation Memory**: Chat history integration
- **File Triggers**: Automatic AI responses in notes
- **Workspace Context**: Vault/file information for AI

### **Debugging Tips**
- **Console Logs**: Look for `===` prefixed logs
- **Provider Selection**: Check `🔧 Creating AI provider:` logs
- **Chat History**: Look for `Chat history length:` messages
- **Build Errors**: Check TypeScript compilation output

---

**Remember**: Always update [`ARCHITECTURE.md`](ARCHITECTURE.md) and this [`AGENTS.md`](AGENTS.md) file after implementing changes!