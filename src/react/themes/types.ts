import { ReactElement } from 'react';

// Base interfaces following Interface Segregation Principle
export interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  onClear?: () => void;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Theme component interfaces
export interface ThemeComponents {
  Bubble: (props: ChatBubbleProps) => ReactElement;
  Header: (props: ChatHeaderProps) => ReactElement;
  Input: (props: ChatInputProps) => ReactElement;
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