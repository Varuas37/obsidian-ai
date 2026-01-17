import React, { useState, KeyboardEvent } from 'react';
import { ChatInputProps } from '../types';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function MessageInput({ onSend, placeholder = "Message", disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border bg-background/80 backdrop-blur-xl">
      <div className="relative flex-1 min-h-[42px]">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none rounded-full border border-border bg-muted/50 pl-4 pr-14 py-3",
            "text-[15px] placeholder:text-muted-foreground leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 focus:border-[#007AFF]",
            "max-h-32 min-h-[42px]",
            "transition-all duration-200",
          )}
          style={{
            height: "auto",
            minHeight: "42px",
            lineHeight: "1.4",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "42px";
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={cn(
            "absolute right-2 w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
            message.trim() && !disabled ? "bg-[#007AFF] text-white hover:bg-[#0066CC] hover:scale-105" : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed",
          )}
          style={{
            top: "50%",
            transform: "translateY(-50%)"
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}