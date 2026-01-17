import React from 'react';
import { AvatarGenerator } from '../utils/AvatarGenerator';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  theme: 'default' | 'imessage' | 'minimal' | 'discord';
}

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function ChatBubble({ message, isUser, timestamp, theme }: ChatBubbleProps) {
  // Use existing classes for default theme, new classes for themed versions
  if (theme === 'default') {
    return (
      <div className={`ai-chat-message ai-chat-message-${isUser ? 'user' : 'assistant'}`}>
        <div className="ai-chat-message-label">
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        <div className="ai-chat-message-content">
          {message}
        </div>
        {timestamp && (
          <div className="ai-chat-timestamp">
            {timestamp}
          </div>
        )}
      </div>
    );
  }

  // iMessage-style theme
  if (theme === 'imessage') {
    return (
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
            isUser
              ? "bg-[#007AFF] text-white rounded-br-md"
              : "bg-[#E9E9EB] dark:bg-[#3A3A3C] text-black dark:text-white rounded-bl-md",
          )}
        >
          {message}
        </div>
        {timestamp && <span className="text-[11px] text-muted-foreground px-2">{timestamp}</span>}
      </div>
    );
  }

  // Minimal theme
  if (theme === 'minimal') {
    return (
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-[85%] px-3 py-2 text-sm",
            isUser
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
              : "border-l-2 border-blue-500 pl-3 text-gray-700 dark:text-gray-300",
          )}
        >
          {message}
        </div>
        {timestamp && <span className="text-xs text-gray-500 px-1">{timestamp}</span>}
      </div>
    );
  }

  // Discord theme with improved spacing and random avatars
  if (theme === 'discord') {
    const userAvatar = AvatarGenerator.generateAvatar('user', 'You');
    const aiAvatar = AvatarGenerator.generateAvatar('ai-assistant', 'AI Assistant');
    const avatar = isUser ? userAvatar : aiAvatar;
    
    return (
      <div className="flex gap-4 py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: avatar.color }}
        >
          {avatar.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            {timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {timestamp}
              </span>
            )}
          </div>
          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed pr-4">
            {message}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to default
  return (
    <div className={`ai-chat-message ai-chat-message-${isUser ? 'user' : 'assistant'}`}>
      <div className="ai-chat-message-content">
        {message}
      </div>
    </div>
  );
}