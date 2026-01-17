import React from 'react';
import { ChatHeaderProps } from '../types';

export function DefaultHeader({ name, status = "AI Assistant", onClear }: ChatHeaderProps) {
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