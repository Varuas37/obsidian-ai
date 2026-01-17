import React from 'react';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  onClear?: () => void;
  theme: 'default' | 'imessage' | 'minimal' | 'discord';
}

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function ChatHeader({ name, avatar, status = "AI Assistant", onClear, theme }: ChatHeaderProps) {
  // Use existing styles for default theme
  if (theme === 'default') {
    return (
      <div className="ai-chat-header">
        <h3 className="ai-chat-title">{name}</h3>
        <div className="ai-chat-provider-label">{status}</div>
        {onClear && (
          <button 
            className="ai-chat-clear-btn"
            onClick={onClear}
            title="Clear chat history"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  // iMessage-style header
  if (theme === 'imessage') {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white text-sm font-medium flex items-center justify-center">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-foreground">{name}</span>
            <span className="text-[12px] text-muted-foreground">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onClear && (
            <button
              onClick={onClear}
              className="text-[#007AFF] hover:text-[#0066CC] text-sm font-medium px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    );
  }

  // Minimal header
  if (theme === 'minimal') {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  // Discord-style header
  if (theme === 'discord') {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-gray-600 dark:text-gray-400">#</div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{status}</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  // Fallback to default
  return (
    <div className="ai-chat-header">
      <h3 className="ai-chat-title">{name}</h3>
    </div>
  );
}