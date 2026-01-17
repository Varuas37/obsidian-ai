import React, { useState, KeyboardEvent } from 'react';
import { ChatInputProps } from '../types';
import { SendIcon } from '../../utils/Icons';

export function DefaultInput({ onSend, placeholder = "Ask me anything...", disabled }: ChatInputProps) {
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
          <SendIcon className="size-4" />
        )}
      </button>
    </div>
  );
}