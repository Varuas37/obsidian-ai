import React from 'react';
import { ConversationHistoryProps } from '../types';

export const MinimalHistoryPanel: React.FC<ConversationHistoryProps> = ({
  conversations,
  searchQuery,
  isLoading,
  error,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
  onDeleteConversation,
  onClearAllConversations,
  onSearchChange,
  onRetry,
  maxHistoryToShow,
  formatDate
}) => {
  const displayedConversations = conversations.slice(0, maxHistoryToShow);

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: 0,
        background: 'var(--background-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'none'
      }}
    >
      {/* Minimal Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--background-modifier-border)',
          background: 'var(--background-primary)',
          flexShrink: 0
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <h3 
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-normal)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            History
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '2px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-normal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            title="Back"
          >
            ←
          </button>
        </div>
        
        {/* Search */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '3px',
              background: 'transparent',
              color: 'var(--text-normal)',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onNewConversation}
            style={{
              flex: 1,
              padding: '6px 8px',
              background: 'transparent',
              color: 'var(--text-normal)',
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-modifier-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New
          </button>
          <button
            onClick={onClearAllConversations}
            disabled={conversations.length === 0}
            style={{
              padding: '6px 8px',
              background: 'transparent',
              color: conversations.length === 0 ? 'var(--text-faint)' : 'var(--text-normal)',
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '3px',
              fontSize: '12px',
              cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              if (conversations.length > 0) {
                e.currentTarget.style.background = 'var(--background-modifier-hover)';
                e.currentTarget.style.color = 'var(--text-error)';
              }
            }}
            onMouseLeave={(e) => {
              if (conversations.length > 0) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-normal)';
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--background-primary)'
        }}
      >
        {isLoading ? (
          <div 
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div 
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--background-modifier-border)',
                borderTop: '2px solid var(--interactive-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }}
            ></div>
            <div style={{ fontSize: '12px' }}>Loading...</div>
          </div>
        ) : error ? (
          <div 
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-error)'
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '12px' }}>{error}</p>
            <button
              onClick={onRetry}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                color: 'var(--text-normal)',
                border: '1px solid var(--background-modifier-border)',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : displayedConversations.length === 0 ? (
          <div 
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}
          >
            {searchQuery ? 'No matches' : 'No conversations'}
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {displayedConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--background-modifier-border)',
                  cursor: 'pointer',
                  background: conv.id === currentConversationId ? 'var(--background-modifier-hover)' : 'transparent',
                  borderLeft: conv.id === currentConversationId ? '2px solid var(--interactive-accent)' : '2px solid transparent',
                  transition: 'all 0.2s',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  if (conv.id !== currentConversationId) {
                    e.currentTarget.style.background = 'var(--background-modifier-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (conv.id !== currentConversationId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      style={{
                        margin: '0 0 2px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--text-normal)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conv.name}
                    </h4>
                    <div 
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{formatDate(conv.updatedAt)}</span>
                      <span>•</span>
                      <span>{conv.messageCount}msg</span>
                      <span>•</span>
                      <span>{conv.wordCount}w</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    style={{
                      marginLeft: '8px',
                      padding: '2px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-error)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-faint)';
                    }}
                    title="Delete"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {conversations.length > maxHistoryToShow && (
              <div 
                style={{
                  padding: '8px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11px'
                }}
              >
                +{conversations.length - maxHistoryToShow} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};