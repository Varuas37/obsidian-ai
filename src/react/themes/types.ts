import { ReactElement } from 'react';

// Base interfaces following Interface Segregation Principle
export interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

// Extensible button system for headers
export interface HeaderButton {
  id: string;
  label: string;
  icon?: string | ReactElement;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  tooltip?: string;
}

// Context information for header
export interface ContextInfo {
  currentWords: number;
  maxWords: number;
  percentage: number;
}

export interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  buttons?: HeaderButton[];
  contextInfo?: ContextInfo;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface ConversationHistoryProps {
  conversations: any[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
  onDeleteConversation: (conversationId: string, event: React.MouseEvent) => void;
  onClearAllConversations: () => void;
  onSearchChange: (query: string) => void;
  onRetry: () => void;
  maxHistoryToShow: number;
  formatDate: (timestamp: number) => string;
}

// Theme component interfaces
export interface ThemeComponents {
  Bubble: React.FC<ChatBubbleProps>;
  Header: React.FC<ChatHeaderProps>;
  Input: React.FC<ChatInputProps>;
  HistoryPanel: React.FC<ConversationHistoryProps>;
}

// Theme configuration
export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  components: ThemeComponents;
}

export type ThemeName = 'default' | 'imessage' | 'minimal' | 'discord';

// Theme registry for extensibility
export interface ThemeRegistry {
  [themeName: string]: ThemeConfig;
}