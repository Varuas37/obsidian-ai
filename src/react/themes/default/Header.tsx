import React from 'react';
import { ChatHeaderProps } from '../types';

export function DefaultHeader({ name, status = "AI Assistant", buttons = [], contextInfo }: ChatHeaderProps) {
  return (
    <div className="ai-chat-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: contextInfo ? '12px' : '0' }}>
        <div className="ai-chat-header-main">
          <h3 className="ai-chat-title">{name}</h3>
          <div className="ai-chat-provider-label">{status}</div>
        </div>
        
        {/* Icon buttons on the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {buttons.map(button => (
            <button
              key={button.id}
              style={{
                background: 'var(--interactive-normal)',
                border: '1px solid var(--background-modifier-border)',
                borderRadius: '6px',
                padding: '8px',
                color: 'var(--text-normal)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px'
              }}
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip || button.label}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--interactive-hover)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--interactive-normal)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {button.icon}
            </button>
          ))}
        </div>
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
    </div>
  );
}