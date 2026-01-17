import React from 'react';
import { ConversationHistoryProps } from '../types';

export const DiscordHistoryPanel: React.FC<ConversationHistoryProps> = ({
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
        boxShadow: 'none',
        fontFamily: '"Segoe UI", system-ui, sans-serif'
      }}
    >
      {/* Discord Header */}
      <div 
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--background-modifier-border)',
          background: 'var(--background-secondary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              background: '#5865f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <h3 
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-normal)'
            }}
          >
            Message History
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'all 0.2s',
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-normal)';
            e.currentTarget.style.background = 'var(--background-modifier-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'none';
          }}
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--background-modifier-border)' }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--background-modifier-border)',
            borderRadius: '4px',
            background: 'var(--background-secondary)',
            color: 'var(--text-normal)',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--background-modifier-border)', display: 'flex', gap: '8px' }}>
        <button
          onClick={onNewConversation}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#5865f2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4752c4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#5865f2';
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
            background: conversations.length === 0 ? 'var(--background-modifier-border)' : '#ed4245',
            color: conversations.length === 0 ? 'var(--text-faint)' : 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            if (conversations.length > 0) {
              e.currentTarget.style.background = '#c23636';
            }
          }}
          onMouseLeave={(e) => {
            if (conversations.length > 0) {
              e.currentTarget.style.background = '#ed4245';
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
          </svg>
          Clear All
        </button>
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
                borderTop: '2px solid #5865f2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            ></div>
            Loading...
          </div>
        ) : error ? (
          <div 
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#ed4245'
            }}
          >
            <p style={{ margin: '0 0 16px' }}>{error}</p>
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                background: '#5865f2',
                color: 'white',
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
            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#5865f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            {searchQuery ? 'No conversations match your search.' : 'No saved conversations yet.'}
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {displayedConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--background-modifier-border)',
                  cursor: 'pointer',
                  background: conv.id === currentConversationId ? 'var(--background-modifier-hover)' : 'transparent',
                  borderLeft: conv.id === currentConversationId ? '4px solid #5865f2' : '4px solid transparent',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #5865f2, #7289da)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    AI
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      style={{
                        margin: '0 0 4px',
                        fontSize: '14px',
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
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{formatDate(conv.updatedAt)}</span>
                      <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }}></div>
                      <span>{conv.messageCount} messages</span>
                      <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }}></div>
                      <span>{conv.wordCount} words</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    style={{
                      marginLeft: '8px',
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-faint)',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ed4245';
                      e.currentTarget.style.background = 'rgba(237, 66, 69, 0.1)';
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
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}
              >
                Showing first {maxHistoryToShow} of {conversations.length} conversations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};