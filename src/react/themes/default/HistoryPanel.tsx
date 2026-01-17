import React from 'react';
import { ConversationHistoryProps } from '../types';

export const DefaultHistoryPanel: React.FC<ConversationHistoryProps> = ({
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
      {/* Header */}
      <div 
        style={{
          padding: '16px 20px',
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
            marginBottom: '16px'
          }}
        >
          <h3 
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-normal)'
            }}
          >
            Conversation History
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-normal)';
              e.currentTarget.style.background = 'var(--background-modifier-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'none';
            }}
            title="Back to chat"
          >
            ←
          </button>
        </div>
        
        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--background-modifier-border)',
              borderRadius: '6px',
              background: 'var(--background-primary)',
              color: 'var(--text-normal)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onNewConversation}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'var(--interactive-accent)',
              color: 'var(--text-on-accent)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--interactive-accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--interactive-accent)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>
          <button
            onClick={onClearAllConversations}
            disabled={conversations.length === 0}
            style={{
              padding: '8px 12px',
              background: conversations.length === 0 ? 'var(--background-modifier-border)' : '#dc3545',
              color: conversations.length === 0 ? 'var(--text-faint)' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (conversations.length > 0) {
                e.currentTarget.style.background = '#c82333';
              }
            }}
            onMouseLeave={(e) => {
              if (conversations.length > 0) {
                e.currentTarget.style.background = '#dc3545';
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
            </svg>
            Clear All
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
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div 
              style={{
                width: '24px',
                height: '24px',
                border: '2px solid var(--background-modifier-border)',
                borderTop: '2px solid var(--interactive-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            ></div>
            Loading conversations...
          </div>
        ) : error ? (
          <div 
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-error)'
            }}
          >
            <p style={{ margin: '0 0 16px' }}>{error}</p>
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                background: 'var(--interactive-accent)',
                color: 'var(--text-on-accent)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : displayedConversations.length === 0 ? (
          <div 
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            {searchQuery ? 'No conversations match your search.' : 'No saved conversations yet.'}
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {displayedConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--background-modifier-border)',
                  cursor: 'pointer',
                  background: conv.id === currentConversationId ? 'var(--background-modifier-hover)' : 'transparent',
                  borderLeft: conv.id === currentConversationId ? '3px solid var(--interactive-accent)' : '3px solid transparent',
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      style={{
                        margin: '0 0 6px',
                        fontSize: '15px',
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>{formatDate(conv.updatedAt)}</span>
                      <span>•</span>
                      <span>{conv.messageCount} messages</span>
                      <span>•</span>
                      <span>{conv.wordCount} words</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    style={{
                      marginLeft: '12px',
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-error)';
                      e.currentTarget.style.background = 'var(--background-modifier-error-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-faint)';
                      e.currentTarget.style.background = 'none';
                    }}
                    title="Delete conversation"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {conversations.length > maxHistoryToShow && (
              <div 
                style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '14px'
                }}
              >
                Showing first {maxHistoryToShow} of {conversations.length} conversations.
                {searchQuery && " Try refining your search."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};