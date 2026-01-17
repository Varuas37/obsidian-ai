import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  theme: 'default' | 'imessage' | 'minimal' | 'discord';
}

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function ChatInput({ onSend, placeholder = "Ask me anything...", disabled, theme }: ChatInputProps) {
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

  // Use existing classes for default theme
  if (theme === 'default') {
    return (
      <div className="ai-chat-input-container">
        <textarea
          className="ai-chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          className="ai-chat-send-btn"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          title={disabled ? "Sending message..." : "Send message (Enter)"}
        >
          {disabled ? (
            <div className="ai-chat-spinner"></div>
          ) : (
            '✈️'
          )}
        </button>
      </div>
    );
  }

  // iMessage-style input
  if (theme === 'imessage') {
    return (
      <div className="flex items-end gap-2 p-3 border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-full border border-border bg-muted/50 px-4 py-2.5 pr-12",
              "text-[15px] placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 focus:border-[#007AFF]",
              "max-h-32 min-h-[42px]",
              "transition-all duration-200",
            )}
            style={{
              height: "auto",
              minHeight: "42px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={cn(
              "absolute right-2 bottom-1.5 p-1.5 rounded-full transition-all duration-200",
              message.trim() ? "bg-[#007AFF] text-white hover:bg-[#0066CC]" : "bg-muted text-muted-foreground",
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Minimal input
  if (theme === 'minimal') {
    return (
      <div className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          style={{
            height: "auto",
            minHeight: "20px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 text-sm"
        >
          Send
        </button>
      </div>
    );
  }

  // Discord-style input
  if (theme === 'discord') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-600">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
            style={{
              height: "auto",
              minHeight: "20px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Fallback to default
  return (
    <div className="ai-chat-input-container">
      <textarea
        className="ai-chat-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        className="ai-chat-send-btn"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
      >
        ✈️
      </button>
    </div>
  );
}