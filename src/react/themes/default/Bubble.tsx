import React from 'react';
import { ChatBubbleProps } from '../types';
import { MarkdownRenderer } from '../../utils/MarkdownRenderer';

export function DefaultBubble({
  message,
  isUser,
  timestamp,
  enableMarkdown = !isUser,
  enableCopy = !isUser
}: ChatBubbleProps) {
  return (
    <div className={`ai-chat-message ai-chat-message-${isUser ? 'user' : 'assistant'}`}>
      <div className="ai-chat-message-label">
        {isUser ? 'You' : 'AI Assistant'}
      </div>
      <div className="ai-chat-message-content">
        {enableMarkdown ? (
          <MarkdownRenderer
            content={message}
            showCopyButton={enableCopy}
            className="default-theme-markdown"
          />
        ) : (
          message
        )}
      </div>
      {timestamp && (
        <div className="ai-chat-timestamp">
          {timestamp}
        </div>
      )}
    </div>
  );
}