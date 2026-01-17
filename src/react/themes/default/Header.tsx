import React from 'react';
import { ChatHeaderProps } from '../types';

export function DefaultHeader({ name, status = "AI Assistant", buttons = [], contextInfo }: ChatHeaderProps) {
  return (
    <div className="ai-chat-header">
      <div className="ai-chat-header-main">
        <h3 className="ai-chat-title">{name}</h3>
        <div className="ai-chat-provider-label">{status}</div>
      </div>
      
      {/* Context info bar */}
      {contextInfo && (
        <div className="ai-chat-context-bar">
          <div className="ai-chat-context-info">
            <span className="ai-chat-context-text">
              {contextInfo.currentWords.toLocaleString()}/{contextInfo.maxWords.toLocaleString()} words
            </span>
            <div className="ai-chat-context-progress">
              <div
                className="ai-chat-context-fill"
                style={{
                  width: `${Math.min(contextInfo.percentage, 100)}%`,
                  backgroundColor: contextInfo.percentage > 90 ? '#ff4444' : contextInfo.percentage > 70 ? '#ffaa44' : '#44aa44'
                }}
              />
            </div>
            <span className="ai-chat-context-percent">{contextInfo.percentage.toFixed(0)}%</span>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="ai-chat-header-actions">
        {buttons.map(button => (
          <button
            key={button.id}
            className={`ai-chat-action-btn ai-chat-btn-${button.variant || 'secondary'}`}
            onClick={button.onClick}
            disabled={button.disabled}
            title={button.tooltip || button.label}
          >
            {button.icon && <span className="ai-chat-btn-icon">{button.icon}</span>}
            <span className="ai-chat-btn-text">{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}