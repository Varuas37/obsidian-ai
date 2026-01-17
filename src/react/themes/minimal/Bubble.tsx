import React from 'react';
import { ChatBubbleProps } from '../types';
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function MinimalBubble({
  message,
  isUser,
  timestamp,
  enableMarkdown = !isUser,
  enableCopy = !isUser
}: ChatBubbleProps) {
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
        {enableMarkdown ? (
          <MarkdownRenderer
            content={message}
            showCopyButton={enableCopy}
            className="minimal-theme-markdown"
          />
        ) : (
          message
        )}
      </div>
      {timestamp && <span className="text-xs text-gray-500 px-1">{timestamp}</span>}
    </div>
  );
}