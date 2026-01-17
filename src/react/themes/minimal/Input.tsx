import React, { useState, KeyboardEvent } from 'react';
import { ChatInputProps } from '../types';

export function MinimalInput({ onSend, placeholder = "Type a message...", disabled }: ChatInputProps) {
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