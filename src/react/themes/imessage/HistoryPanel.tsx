import React from 'react';
import { ConversationHistoryProps } from '../types';

export const iMessageHistoryPanel: React.FC<ConversationHistoryProps> = ({
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

  const formatiOSDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return 'Now';
      if (diffMinutes < 60) return `${diffMinutes}m`;
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
  };

  const getConversationPreview = (conv: any): string => {
    if (conv.name.length > 60) {
      return conv.name.substring(0, 60) + '...';
    }
    return conv.name;
  };

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}
    >
      {/* iOS Messages Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--background-primary)',
          minHeight: '60px'
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#007AFF',
            fontSize: '17px',
            fontWeight: '400',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Back
        </button>
        
        <h1 
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '600',
            color: 'var(--text-normal)',
            textAlign: 'center'
          }}
        >
          Conversations
        </h1>
        
        <button
          onClick={onNewConversation}
          style={{
            background: 'none',
            border: 'none',
            color: '#007AFF',
            fontSize: '20px',
            fontWeight: '300',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
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
              padding: '60px 40px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div 
              style={{
                width: '24px',
                height: '24px',
                border: '2px solid var(--background-modifier-border)',
                borderTop: '2px solid #007AFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            ></div>
            <div style={{ fontSize: '17px' }}>Loading...</div>
          </div>
        ) : error ? (
          <div 
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              color: 'var(--text-error)'
            }}
          >
            <p style={{ margin: '0 0 20px', fontSize: '17px' }}>{error}</p>
            <button
              onClick={onRetry}
              style={{
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : displayedConversations.length === 0 ? (
          <div 
            style={{
              padding: '80px 40px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <p style={{ fontSize: '17px', margin: '0 0 8px', fontWeight: '500' }}>
              No Messages
            </p>
            <p style={{ fontSize: '15px', margin: 0, opacity: 0.7 }}>
              {searchQuery ? 'No conversations match your search' : 'Start a conversation to see messages here'}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            {displayedConversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                style={{
                  padding: '12px 20px',
                  borderBottom: index === displayedConversations.length - 1 ? 'none' : '0.5px solid var(--background-modifier-border)',
                  cursor: 'pointer',
                  background: conv.id === currentConversationId ? '#007AFF20' : 'transparent',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.2s',
                  position: 'relative'
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  {/* Avatar */}
                  <div 
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4F8FFF, #6366F1)',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    AI
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        <h3 
                          style={{
                            margin: 0,
                            fontSize: '17px',
                            fontWeight: '500',
                            color: 'var(--text-normal)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {conv.name}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                          style={{
                            fontSize: '15px',
                            color: 'var(--text-muted)',
                            flexShrink: 0
                          }}
                        >
                          {formatiOSDate(conv.updatedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this conversation?")) {
                              onDeleteConversation(conv.id, e);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-faint)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color 0.2s',
                            opacity: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FF3B30';
                            e.currentTarget.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-faint)';
                            e.currentTarget.style.opacity = '0.5';
                          }}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p 
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.3'
                      }}
                    >
                      {getConversationPreview(conv)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {conversations.length > maxHistoryToShow && (
              <div 
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '15px'
                }}
              >
                Showing {maxHistoryToShow} of {conversations.length} conversations
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};