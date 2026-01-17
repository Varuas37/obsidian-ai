import React from 'react';
import { ChatBubbleProps } from '../types';

export function DefaultBubble({ message, isUser, timestamp }: ChatBubbleProps) {
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