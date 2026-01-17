# AI Agents Guide - Obsidian AI Assistant Plugin

> **For AI Assistants working on this codebase**

## 🎯 Plugin Purpose & Context

This is an **Obsidian AI Assistant plugin** that integrates AI capabilities directly into Obsidian note-taking workflows. For detailed architecture information, see [`ARCHITECTURE.md`](ARCHITECTURE.md).

### **Core User Workflows**
- **Chat Interface**: React-powered sidebar with conversation persistence and theme-specific history panels
- **Conversation History**: Full-screen navigation with theme-aware designs (iOS Messages, Discord, etc.)
- **Auto-Save System**: Intelligent conversation persistence with user-configurable settings
- **File Triggers**: Auto-response to `ai question??` patterns in notes
- **Hotkey Processing**: AI processes notes using custom `prompt.md` files
- **Quick Questions**: Modal interface for fast queries
- **Context Tracking**: Real-time word count with configurable limits

## 🏗️ Development Environment Setup

### **Essential Files to Understand**
- **Architecture**: [`ARCHITECTURE.md`](ARCHITECTURE.md) - Complete system architecture
- **Plugin Entry**: [`src/main.ts`](src/main.ts) - Plugin orchestrator  
- **Chat UI**: [`src/react/ChatInterface.tsx`](src/react/ChatInterface.tsx) - Main React component
- **AI Logic**: [`src/core/ai-service.ts`](src/core/ai-service.ts) - AI coordination
- **Settings**: [`src/settings/settings-manager.ts`](src/settings/settings-manager.ts) - Configuration

### **Build Commands**
```bash
npm install          # Install dependencies
npm run dev          # Watch mode (development)
npm run build        # Production build & type checking
```

## 🚀 How to Add New Features

### **1. Adding New AI Providers**
Following the new SOLID-compliant architecture, adding providers is now much simpler:

```typescript
// Step 1: Create provider extending BaseAIProvider in ai-providers.ts
export class MyNewProvider extends BaseAIProvider {
  constructor(settings: PluginSettings) {
    super(settings, 'My New Provider');
  }

  // Only implement the factory methods - no duplication!
  protected createPromptBuilder(): PromptBuilder {
    return new StandardPromptBuilder(); // Or create custom one
  }

  protected createResponseAdapter(): ResponseAdapter {
    return new MyNewResponseAdapter(); // Create custom adapter
  }

  protected createRequestExecutor(): RequestExecutor {
    return new TimedRequestExecutor(this.providerName, async (prompt: string | PromptStructure) => {
      // Your API call logic here
      const response = await fetch(/* your API endpoint */);
      return response.json();
    });
  }

  // Configuration methods
  isConfigured(): boolean { return Boolean(this.settings.myNewApiKey); }
  getConfigurationHelp(): string { return "Setup instructions"; }
}

// Step 2: Add to factory in ai-service.ts
case "mynew": return new MyNewProvider(settings);

// Step 3: Update settings interface and defaults
// Step 4: Add settings UI in settings-tab.ts
```

**Benefits of New Architecture:**
- **No Code Duplication**: Common logic is shared via [`BaseAIProvider`](src/core/ai-providers.ts:342)
- **Single Responsibility**: Each component has one job (prompt building, request execution, response parsing, error handling)
- **Easy Extension**: Adding new providers requires minimal boilerplate (~20 lines vs ~100+ lines before)
- **Consistent Error Handling**: All providers use the same error handling patterns automatically
- **Type Safety**: Full TypeScript support with proper interfaces

### **2. Adding New Chat Themes**
Follow the extensible button system with [`HeaderButton[]`](src/react/themes/types.ts:11) interface:

```typescript
// Each theme implements ChatHeaderProps with:
// - buttons?: HeaderButton[]     // Extensible action buttons
// - contextInfo?: ContextInfo    // Word count display
// - No hardcoded functionality
```

### **3. Adding Conversation Features**
Use [`ConversationManager`](src/core/conversation-manager.ts) for persistence:
```typescript
const conversationManager = ConversationManager.getInstance(app);
await conversationManager.saveConversation(messages, conversationId);
const conversation = await conversationManager.loadConversation(id);
const metadata = await conversationManager.getConversationMetadata();
```

### **4. Creating Theme-Specific History Panels**
Each theme now includes its own HistoryPanel component:
```typescript
// Add to theme components interface in types.ts
export interface ThemeComponents {
  Bubble: React.FC<ChatBubbleProps>;
  Header: React.FC<ChatHeaderProps>;
  Input: React.FC<ChatInputProps>;
  HistoryPanel: React.FC<ConversationHistoryProps>; // New!
}

// Example: iMessage theme history panel
export const iMessageHistoryPanel: React.FC<ConversationHistoryProps> = ({
  conversations, onSelectConversation, onClose, // ... other props
}) => {
  return <div>iOS Messages-style interface</div>;
};
```

### **5. Using Theme-Aware Conversation History**
The ChatInterface automatically uses the correct theme's HistoryPanel:
```typescript
// Show history view using theme-specific component
if (showHistoryPanel) {
  return (
    <div className={currentTheme === 'default' ? 'ai-chat-container' : `ai-chat-container-${currentTheme}`}>
      <themeComponents.HistoryPanel
        conversations={filteredConversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleConversationSelect}
        onNewConversation={startNewChat}
        onClose={() => setShowHistoryPanel(false)}
        // ... all other props
      />
    </div>
  );
}
```

### **5. Adding New Commands**
```typescript
// In command-handler.ts
plugin.addCommand({
  id: "my-new-command",
  name: "My New Command",
  callback: () => this.handleMyNewCommand()
});
```

### **6. Adding React Components**
```typescript
import React from 'react';
import { useAIService, useSettings, useApp } from './context';

export const MyComponent: React.FC = () => {
  const aiService = useAIService();
  const settings = useSettings();
  const app = useApp();
  return <div>Component content</div>;
};
```

## 🎨 Theme System Development

### **Extensible Button System**
The new button system removes theme coupling:
```typescript
// Instead of hardcoded buttons, pass dynamic actions:
const headerButtons: HeaderButton[] = [
  {
    id: 'new-chat',
    label: 'New Chat',
    icon: '➕',
    onClick: startNewChat,
    variant: 'primary'
  }
];
```

### **Context Tracking Integration**
All themes now support:
```typescript
interface ContextInfo {
  currentWords: number;
  maxWords: number;
  percentage: number;
}
```

## ⚠️ Critical Development Guidelines

### **🔄 Documentation Responsibility**
**Always update documentation after changes:**
1. **[`ARCHITECTURE.md`](ARCHITECTURE.md)** - Architectural changes, patterns, structure
2. **[`AGENTS.md`](AGENTS.md)** (this file) - Development guidance updates

### **🧪 Required Testing**
- **Build**: `npm run build` must succeed
- **TypeScript**: No compilation errors
- **Functionality**: Test in Obsidian environment
- **Regression**: Verify existing features work

### **💡 Code Quality Standards**
- **Type Safety**: Avoid `any`, use proper TypeScript types
- **Error Handling**: Comprehensive try/catch blocks
- **Logging**: Clear debug logs with `=== MODULE: action ===` format
- **Clean Code**: JSDoc comments for complex functions

### **🚫 Common Pitfalls**
- **Don't edit `main.js`** - It's generated from `src/main.ts`
- **Don't break provider interfaces** - All must implement `AIProvider`
- **Don't ignore context** - New providers should use chat history
- **Don't skip cleanup** - Always implement proper cleanup
- **Don't mix concerns** - Single responsibility per module

### **✅ Best Practices**
- **Follow existing patterns** for consistency
- **Use React contexts** for dependency access
- **Add comprehensive logging** for debugging
- **Test all providers** independently
- **Keep documentation current**

## 🔧 File Modification Patterns

### **Settings Changes**
1. [`settings-manager.ts`](src/settings/settings-manager.ts) - Interface & defaults
2. [`settings-tab.ts`](src/settings/settings-tab.ts) - Settings UI
3. Validation in `validateSettings()` method

### **UI Changes**
1. **React**: [`src/react/`](src/react/) - Components and themes
2. **Styling**: [`styles-manager.ts`](src/ui/styles-manager.ts) - CSS classes
3. **View**: [`react-chat-view.tsx`](src/ui/react-chat-view.tsx) - Obsidian integration

### **Business Logic**
1. **AI Logic**: [`ai-service.ts`](src/core/ai-service.ts) - Service coordination
2. **Providers**: [`ai-providers.ts`](src/core/ai-providers.ts) - Implementation
3. **Context**: Update `WorkspaceContext` interface as needed

## 🎓 Understanding the Codebase

### **Learning Path**
1. **Read [`ARCHITECTURE.md`](ARCHITECTURE.md)** - Understand complete system design
2. **Explore [`main.ts`](src/main.ts)** - Plugin initialization and dependency injection
3. **Study [`ChatInterface.tsx`](src/react/ChatInterface.tsx)** - React integration patterns
4. **Review [`ai-service.ts`](src/core/ai-service.ts)** - Business logic coordination

### **Key Architectural Concepts**
For detailed architecture information, see [`ARCHITECTURE.md`](ARCHITECTURE.md):
- Provider Pattern & Factory implementation
- React Context dependency injection
- SOLID principles in theme system
- Conversation persistence architecture
- Context tracking and management

### **Debugging Approach**
- **Console logs**: Look for `===` prefixed messages
- **Provider logs**: Check `🔧 Creating AI provider:` messages
- **Build errors**: Review TypeScript compilation output
- **Theme system**: Debug with theme state change logs

---

**Remember**: This file focuses on development guidance. Refer to [`ARCHITECTURE.md`](ARCHITECTURE.md) for architectural details, patterns, and system design information.