# Theme Development Prompt for Obsidian AI Assistant Plugin

You are tasked with creating a new chat theme for the Obsidian AI Assistant plugin. This plugin uses a SOLID-compliant, extensible theme system that separates concerns and follows modern React patterns.

## 🏗️ Theme System Architecture

### **Current Theme Structure**
The plugin uses a modular theme system where each theme consists of exactly **3 components**:
- **Bubble.tsx**: Message display components
- **Header.tsx**: Chat header with extensible buttons and context info
- **Input.tsx**: Message input interface
- **index.ts**: Theme configuration and exports

### **Essential Files to Understand**

**CRITICALLY IMPORTANT - Read these first:**
1. **[`src/react/themes/types.ts`](src/react/themes/types.ts)** - Theme interface contracts (MUST implement)
2. **[`src/react/themes/imessage/`](src/react/themes/imessage/)** - Reference implementation (USE AS TEMPLATE)
3. **[`src/react/themes/ThemeProvider.ts`](src/react/themes/ThemeProvider.ts)** - Where to register new theme

**Supporting Reference Files:**
4. **[`src/react/ChatInterface.tsx`](src/react/ChatInterface.tsx)** - How themes are used
5. **[`src/settings/settings-manager.ts`](src/settings/settings-manager.ts)** - Theme settings integration

## 📋 Required Interfaces (MUST IMPLEMENT)

### **1. ChatBubbleProps Interface**
```typescript
interface ChatBubbleProps {
  message: string;        // The message content
  isUser: boolean;        // true for user messages, false for AI
  timestamp?: string;     // Optional timestamp string
}
```

### **2. ChatHeaderProps Interface (NEW EXTENSIBLE SYSTEM)**
```typescript
interface ChatHeaderProps {
  name: string;                    // Chat title
  avatar?: string;                 // Optional avatar
  status?: string;                 // Status text (e.g., "Using: OpenAI GPT")
  buttons?: HeaderButton[];        // Extensible action buttons
  contextInfo?: ContextInfo;       // Word count tracking display
}
```

### **3. ChatInputProps Interface**
```typescript
interface ChatInputProps {
  onSend: (message: string) => void;   // Send message callback
  placeholder?: string;                // Input placeholder text
  disabled?: boolean;                  // Disable input during processing
}
```

### **4. New Extensible Button System**
```typescript
interface HeaderButton {
  id: string;                     // Unique identifier
  label: string;                  // Button text
  icon?: string;                  // Optional emoji/icon
  onClick: () => void;            // Click handler
  variant?: 'primary' | 'secondary' | 'danger';  // Style variant
  disabled?: boolean;             // Disable state
  tooltip?: string;               // Tooltip text
}
```

### **5. Context Information Display**
```typescript
interface ContextInfo {
  currentWords: number;           // Current word count in conversation
  maxWords: number;               // Maximum allowed words
  percentage: number;             // Usage percentage (0-100)
}
```

## 🎨 Implementation Requirements

### **STEP 1: Study the Reference Implementation**
**MANDATORY**: Examine [`src/react/themes/imessage/`](src/react/themes/imessage/) folder structure:
- **Header.tsx**: Shows how to handle buttons and contextInfo
- **Bubble.tsx**: Message styling patterns
- **Input.tsx**: Input handling patterns
- **index.ts**: Theme configuration export

### **STEP 2: Create Your Theme Folder**
Create: `src/react/themes/[THEME_NAME]/`
```
[THEME_NAME]/
├── Bubble.tsx    # Message bubbles
├── Header.tsx    # Header with buttons & context
├── Input.tsx     # Message input
└── index.ts      # Theme config
```

### **STEP 3: Implement Required Components**

**Critical Requirements:**
- **Header MUST support**: `buttons` array and `contextInfo` display
- **All components MUST**: Use proper TypeScript interfaces
- **Styling MUST**: Work with Obsidian's CSS variables
- **Components MUST**: Handle undefined/optional props gracefully

## ⚠️ Critical Implementation Checkpoints

### **Before You Start:**
1. **Read [`src/react/themes/types.ts`](src/react/themes/types.ts)** - Understand ALL interfaces
2. **Study [`src/react/themes/imessage/Header.tsx`](src/react/themes/imessage/Header.tsx)** - See how buttons + contextInfo work
3. **Check [`src/react/ChatInterface.tsx`](src/react/ChatInterface.tsx) lines 338-362** - See how themes are called

### **During Implementation:**
1. **Header Component**: MUST render `buttons` array dynamically
2. **Context Info**: MUST display progress bar when `contextInfo` provided
3. **TypeScript**: All props MUST match interface contracts exactly
4. **Styling**: Use consistent CSS patterns from existing themes

### **After Implementation:**
1. **Register Theme**: Add to [`src/react/themes/ThemeProvider.ts`](src/react/themes/ThemeProvider.ts)
2. **Settings Integration**: Update [`src/settings/settings-manager.ts`](src/settings/settings-manager.ts) theme types
3. **Test Build**: Run `npm run build` to verify TypeScript compliance

## 🔧 Theme Registration Pattern

### **Step 1: Export from index.ts**
```typescript
import { ThemeConfig } from '../types';
import { MyThemeBubble } from './Bubble';
import { MyThemeHeader } from './Header';  
import { MyThemeInput } from './Input';

export const myTheme: ThemeConfig = {
  name: 'mytheme',
  displayName: 'My Theme',
  description: 'Custom theme description',
  components: {
    Bubble: MyThemeBubble,
    Header: MyThemeHeader,
    Input: MyThemeInput
  }
};
```

### **Step 2: Register in ThemeProvider**
Add to [`src/react/themes/ThemeProvider.ts`](src/react/themes/ThemeProvider.ts):
```typescript
import { myTheme } from './mytheme';

this.themes = {
  // ... existing themes
  mytheme: myTheme
};
```

### **Step 3: Update Settings Types**
Add to [`src/settings/settings-manager.ts`](src/settings/settings-manager.ts):
```typescript
chatTheme: 'default' | 'imessage' | 'minimal' | 'discord' | 'mytheme';
```

## 🎯 Specific Implementation Guidance

### **Header Component Priority Features**
1. **Dynamic Button Rendering**: Loop through `buttons` array
2. **Context Progress Bar**: Visual display when `contextInfo` present
3. **Responsive Layout**: Works on different screen sizes
4. **Theme Consistency**: Matches overall theme aesthetic

### **Bubble Component Essentials**
- User vs AI message distinction
- Timestamp handling (optional)
- Consistent spacing and typography
- Theme-appropriate colors and styling

### **Input Component Requirements**
- Send functionality with Enter key support
- Disabled state during AI processing  
- Placeholder text support
- Theme-consistent styling

## 📚 Reference Material Hierarchy

**Primary References (MUST READ):**
1. [`src/react/themes/imessage/`](src/react/themes/imessage/) - Complete working example
2. [`src/react/themes/types.ts`](src/react/themes/types.ts) - All required interfaces

**Secondary References (HELPFUL):**
3. [`src/react/themes/minimal/`](src/react/themes/minimal/) - Clean, simple example
4. [`src/react/themes/discord/`](src/react/themes/discord/) - Feature-rich example

**Integration References:**
5. [`src/react/ChatInterface.tsx`](src/react/ChatInterface.tsx) - How themes are consumed
6. [`ARCHITECTURE.md`](ARCHITECTURE.md) - Complete system understanding

## 🚨 Critical Success Factors

1. **Interface Compliance**: Components MUST match TypeScript interfaces exactly
2. **Button System**: Header MUST support extensible button array
3. **Context Display**: Header MUST show context info when provided  
4. **Build Success**: `npm run build` MUST complete without errors
5. **Registration**: Theme MUST be properly registered in ThemeProvider

**Remember**: The theme system is designed to be theme-agnostic for functionality. Your theme should focus on styling and layout, not implementing specific features like "Clear" buttons - those are now provided through the extensible button system.