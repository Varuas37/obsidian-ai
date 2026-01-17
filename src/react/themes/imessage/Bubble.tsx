import React from 'react';
import { ChatBubbleProps } from '../types';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function iMessageBubble({ message, isUser, timestamp }: ChatBubbleProps) {
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