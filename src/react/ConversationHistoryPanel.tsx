import React, { useState, useEffect } from 'react';
import { useApp, useSettings } from './context';
import { ConversationManager, ConversationMetadata } from '../core/conversation-manager';
import { DeleteIcon, PlusIcon } from './utils/Icons';

interface ConversationHistoryPanelProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
  currentConversationId: string | null;
}

/**
 * Conversation History Panel Component - Full Screen (No Modal)
 * Displays saved conversations with search, delete, and load functionality
 */
export const ConversationHistoryPanel: React.FC<ConversationHistoryPanelProps> = ({
  onSelectConversation,
  onNewConversation,
  onClose,
  currentConversationId
}) => {
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const app = useApp();
  const settings = useSettings();
  const conversationManager = React.useMemo(() => {
    return ConversationManager.getInstance(app);
  }, [app]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("=== CONVERSATION HISTORY: Loading conversations ===");
      
      const metadata = await conversationManager.getConversationMetadata();
      setConversations(metadata);
      
      console.log(`=== CONVERSATION HISTORY: Loaded ${metadata.length} conversations ===`);
    } catch (err) {
      console.error("=== CONVERSATION HISTORY: Error loading conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent conversation selection
    
    try {
      console.log(`=== CONVERSATION HISTORY: Deleting conversation ${conversationId} ===`);
      await conversationManager.deleteConversation(conversationId);
      await loadConversations(); // Refresh list
      
      // If we deleted the current conversation, start a new one
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error("=== CONVERSATION HISTORY: Error deleting conversation:", err);
      setError("Failed to delete conversation");
    }
  };

  const handleClearAllConversations = async () => {
    if (!confirm("Are you sure you want to delete all conversations? This action cannot be undone.")) {
      return;
    }
    
    try {
      console.log("=== CONVERSATION HISTORY: Clearing all conversations ===");
      await conversationManager.clearAllConversations();
      setConversations([]);
      onNewConversation(); // Start fresh
    } catch (err) {
      console.error("=== CONVERSATION HISTORY: Error clearing conversations:", err);
      setError("Failed to clear conversations");
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const settingsData = settings.getSettings();
  const maxHistoryToShow = settingsData.maxConversationHistory || 50;
  const displayedConversations = filteredConversations.slice(0, maxHistoryToShow);

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
      {/* Header - Full Width */}
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--interactive-accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--interactive-accent)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusIcon className="size-4" />
              New Chat
            </div>
          </button>
          <button
            onClick={handleClearAllConversations}
            disabled={conversations.length === 0}
            style={{
              padding: '8px 12px',
              background: conversations.length === 0 ? 'var(--background-modifier-border)' : '#dc3545',
              color: conversations.length === 0 ? 'var(--text-faint)' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: conversations.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DeleteIcon className="size-4" />
              Clear All
            </div>
          </button>
        </div>
      </div>

      {/* Content - Full Height */}
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
              onClick={loadConversations}
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
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
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
                    <DeleteIcon className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredConversations.length > maxHistoryToShow && (
              <div 
                style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '14px'
                }}
              >
                Showing first {maxHistoryToShow} of {filteredConversations.length} conversations.
                {searchQuery && " Try refining your search."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};