import React from 'react';
import { ChatBubbleProps } from '../types';
import { AvatarGenerator } from '../../utils/AvatarGenerator';
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';

export function DiscordBubble({
  message,
  isUser,
  timestamp,
  enableMarkdown = !isUser,
  enableCopy = !isUser
}: ChatBubbleProps) {
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
          {enableMarkdown ? (
            <MarkdownRenderer
              content={message}
              showCopyButton={enableCopy}
              className="discord-theme-markdown"
            />
          ) : (
            message
          )}
        </div>
      </div>
    </div>
  );
}