import React, { useState, useRef, useEffect } from 'react';
import { useAIService, useSettings, useApp } from './context';
import { ThemeProvider, ThemeName } from './themes';
import { HeaderButton, ContextInfo } from './themes/types';
import { ConversationManager, StoredMessage } from '../core/conversation-manager';
import { ConversationHistoryPanel } from './ConversationHistoryPanel';
import { MessageIcon, HistoryIcon, EditIcon, PlusIcon } from './utils/Icons';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<ContextInfo>({ currentWords: 0, maxWords: 8000, percentage: 0 });
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const aiService = useAIService();
  const settingsManager = useSettings();
  const app = useApp();
  
  // Initialize conversation manager
  const conversationManager = React.useMemo(() => {
    return ConversationManager.getInstance(app);
  }, [app]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate context info when messages change
  useEffect(() => {
    const settings = settingsManager.getSettings();
    if (settings.enableContextTracking) {
      const wordCount = messages.reduce((total, msg) => {
        if (!msg.isThinking) {
          return total + msg.content.trim().split(/\s+/).length;
        }
        return total;
      }, 0);
      
      const maxWords = settings.contextWindowSize;
      const percentage = Math.min((wordCount / maxWords) * 100, 100);
      
      setContextInfo({
        currentWords: wordCount,
        maxWords: maxWords,
        percentage: percentage
      });
      
      console.log(`=== CHAT INTERFACE: Context tracking - ${wordCount}/${maxWords} words (${percentage.toFixed(1)}%) ===`);
    }
  }, [messages, settingsManager]);

  // Watch for theme changes and update state with detailed logging
  useEffect(() => {
    const settings = settingsManager.getSettings();
    const newTheme = settings.chatTheme || 'default';
    console.log("=== CHAT INTERFACE: Theme change detected:", newTheme);
    console.log("=== CHAT INTERFACE: Previous theme:", currentTheme);
    console.log("=== CHAT INTERFACE: Will render components with theme:", newTheme);
    
    if (newTheme !== currentTheme) {
      setCurrentTheme(newTheme);
      console.log("=== CHAT INTERFACE: Theme state updated to:", newTheme);
    }
  }, [settingsManager, currentTheme]);

  // Also check theme on component mount
  useEffect(() => {
    const settings = settingsManager.getSettings();
    const initialTheme = settings.chatTheme || 'default';
    console.log("=== CHAT INTERFACE: Initial theme:", initialTheme);
    console.log("=== CHAT INTERFACE: Component mounted with theme:", initialTheme);
    setCurrentTheme(initialTheme);
  }, []);

  // Add debug effect to track currentTheme changes
  useEffect(() => {
    console.log("=== CHAT INTERFACE: currentTheme state changed to:", currentTheme);
    console.log("=== CHAT INTERFACE: Will use container class:", currentTheme === 'default' ? 'ai-chat-container' : `ai-chat-container-${currentTheme}`);
  }, [currentTheme]);

  // Add welcome message on component mount
  useEffect(() => {
    const settings = settingsManager.getSettings();
    const providerName = getProviderDisplayName(settings.aiProvider);
    
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: `Hello! I'm your AI assistant powered by ${providerName}. You can ask me questions about your notes, request help with tasks, or just chat. I have access to your vault context and can help with various tasks.`,
      timestamp: new Date()
    }]);
  }, [settingsManager]);

  // Auto-save conversation when messages change
  useEffect(() => {
    const settings = settingsManager.getSettings();
    if (settings.autoSaveConversations && messages.length > 1) { // Don't save just welcome message
      saveCurrentConversation();
    }
  }, [messages, settingsManager]);

  const getProviderDisplayName = (provider: string): string => {
    const names: Record<string, string> = {
      cli: "CLI",
      anthropic: "Anthropic Claude",
      openai: "OpenAI GPT",
      openrouter: "OpenRouter",
      ollama: "Ollama (Local)"
    };
    return names[provider] || provider;
  };

  /**
   * Convert Message[] to StoredMessage[]
   */
  const convertToStoredMessages = (messages: Message[]): StoredMessage[] => {
    return messages
      .filter(msg => !msg.isThinking && msg.id !== 'welcome') // Exclude thinking and welcome messages
      .map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.getTime()
      }));
  };

  /**
   * Convert StoredMessage[] to Message[]
   */
  const convertFromStoredMessages = (storedMessages: StoredMessage[]): Message[] => {
    return storedMessages.map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    }));
  };

  /**
   * Save current conversation
   */
  const saveCurrentConversation = async () => {
    try {
      const storedMessages = convertToStoredMessages(messages);
      if (storedMessages.length === 0) return;
      
      // Pass current settings to capture proper configuration snapshot
      const currentSettings = settingsManager.getSettings();
      console.log("=== CHAT INTERFACE: Saving conversation with settings ===", {
        aiProvider: currentSettings.aiProvider,
        model: currentSettings.openaiModel,
        apiType: currentSettings.openaiApiType
      });
      
      const conversationId = await conversationManager.saveConversation(
        storedMessages,
        currentConversationId || undefined,
        currentSettings // ✅ Pass current settings for proper config snapshot
      );
      
      if (!currentConversationId) {
        setCurrentConversationId(conversationId);
        console.log(`=== CHAT INTERFACE: New conversation saved with ID: ${conversationId} ===`);
      }
    } catch (error) {
      console.error("=== CHAT INTERFACE: Error saving conversation:", error);
    }
  };

  /**
   * Load a conversation by ID
   */
  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await conversationManager.loadConversation(conversationId);
      if (conversation) {
        const loadedMessages = convertFromStoredMessages(conversation.messages);
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
        console.log(`=== CHAT INTERFACE: Loaded conversation ${conversationId} with ${loadedMessages.length} messages ===`);
      }
    } catch (error) {
      console.error("=== CHAT INTERFACE: Error loading conversation:", error);
    }
  };

  /**
   * Start a new conversation
   */
  const startNewChat = async () => {
    // Save current conversation if it has content and auto-save is enabled
    const settings = settingsManager.getSettings();
    if (settings.autoSaveConversations && messages.length > 1 && currentConversationId) {
      await saveCurrentConversation();
    }
    
    // Reset to welcome message
    const providerName = getProviderDisplayName(settings.aiProvider);
    
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: `Hello! I'm your AI assistant powered by ${providerName}. You can ask me questions about your notes, request help with tasks, or just chat. I have access to your vault context and can help with various tasks.`,
      timestamp: new Date()
    }]);
    
    setCurrentConversationId(null);
    setShowHistoryPanel(false); // Close history panel when starting new chat
    console.log("=== CHAT INTERFACE: Started new chat ===");
  };

  /**
   * Show/hide conversation history panel
   */
  const toggleHistory = async () => {
    if (!showHistoryPanel) {
      // Load conversations when opening history
      await loadConversations();
    }
    setShowHistoryPanel(!showHistoryPanel);
    console.log(`=== CHAT INTERFACE: History panel ${!showHistoryPanel ? 'opened' : 'closed'} ===`);
  };

  /**
   * Load conversations for history panel
   */
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      setConversationError(null);
      console.log("=== CHAT INTERFACE: Loading conversations for history ===");
      
      const metadata = await conversationManager.getConversationMetadata();
      setConversations(metadata);
      
      console.log(`=== CHAT INTERFACE: Loaded ${metadata.length} conversations for history ===`);
    } catch (err) {
      console.error("=== CHAT INTERFACE: Error loading conversations:", err);
      setConversationError("Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  /**
   * Handle conversation selection from history
   */
  const handleConversationSelect = async (conversationId: string) => {
    // Save current conversation if it has content and auto-save is enabled
    const settings = settingsManager.getSettings();
    if (settings.autoSaveConversations && messages.length > 1 && currentConversationId && currentConversationId !== conversationId) {
      await saveCurrentConversation();
    }
    
    // Load the selected conversation
    await loadConversation(conversationId);
    setShowHistoryPanel(false); // Close history panel after selection
  };

  /**
   * Handle deleting a conversation
   */
  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent conversation selection
    
    try {
      console.log(`=== CHAT INTERFACE: Deleting conversation ${conversationId} ===`);
      await conversationManager.deleteConversation(conversationId);
      await loadConversations(); // Refresh list
      
      // If we deleted the current conversation, start a new one
      if (conversationId === currentConversationId) {
        await startNewChat();
      }
    } catch (err) {
      console.error("=== CHAT INTERFACE: Error deleting conversation:", err);
      setConversationError("Failed to delete conversation");
    }
  };

  /**
   * Handle clearing all conversations
   */
  const handleClearAllConversations = async () => {
    if (!confirm("Are you sure you want to delete all conversations? This action cannot be undone.")) {
      return;
    }
    
    try {
      console.log("=== CHAT INTERFACE: Clearing all conversations ===");
      await conversationManager.clearAllConversations();
      setConversations([]);
      await startNewChat(); // Start fresh
    } catch (err) {
      console.error("=== CHAT INTERFACE: Error clearing conversations:", err);
      setConversationError("Failed to clear conversations");
    }
  };

  /**
   * Format date for conversation display
   */
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

  /**
   * Trim messages to fit context window
   */
  const trimMessagesForContext = (messages: Message[]): Message[] => {
    const settings = settingsManager.getSettings();
    if (!settings.enableContextTracking) return messages;
    
    const maxWords = settings.contextWindowSize;
    let totalWords = 0;
    const trimmedMessages: Message[] = [];
    
    // Work backwards from most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.isThinking || message.id === 'welcome') continue;
      
      const messageWords = message.content.trim().split(/\s+/).length;
      
      if (totalWords + messageWords <= maxWords) {
        trimmedMessages.unshift(message);
        totalWords += messageWords;
      } else {
        console.log(`=== CHAT INTERFACE: Trimmed ${messages.length - trimmedMessages.length} messages to fit context window ===`);
        break;
      }
    }
    
    return trimmedMessages;
  };

  const handleSendMessage = async (message: string) => {
    if (!message || isProcessing) return;

    console.log("=== REACT CHAT: Starting message send ===");
    console.log("Chat message:", message);

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Add thinking message
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      type: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isThinking: true
    };
    
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const startTime = Date.now();
      
      // Pass current messages as chat history for context, trimmed to fit context window
      const chatHistory = trimMessagesForContext(messages.filter(msg => !msg.isThinking));
      console.log("REACT CHAT: Sending", chatHistory.length, "history messages");
      
      const response = await aiService.askQuestion(message, chatHistory);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(`REACT CHAT: Response received in ${duration}s, length:`, response.length);

      // Remove thinking message and add response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingMessage.id);
        return [
          ...filtered,
          {
            id: `assistant-${Date.now()}`,
            type: 'assistant',
            content: response,
            timestamp: new Date()
          }
        ];
      });
      
      console.log("REACT CHAT: Message processing completed");

    } catch (error) {
      console.error("REACT CHAT: Error occurred:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Remove thinking message and add error
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingMessage.id);
        return [
          ...filtered,
          {
            id: `error-${Date.now()}`,
            type: 'assistant',
            content: `Sorry, I encountered an error: ${errorMessage}`,
            timestamp: new Date()
          }
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Create header buttons with theme-appropriate icons
  const getHeaderButtons = (): HeaderButton[] => {
    const baseButtons: HeaderButton[] = [];
    
    // New Chat button with theme-specific styling
    if (currentTheme === 'imessage') {
      baseButtons.push({
        id: 'new-chat',
        label: '',
        icon: <EditIcon className="size-5" />,
        onClick: startNewChat,
        variant: 'primary',
        tooltip: 'New message'
      });
    } else if (currentTheme === 'discord') {
      baseButtons.push({
        id: 'new-chat',
        label: '',
        icon: <MessageIcon className="size-5" />,
        onClick: startNewChat,
        variant: 'primary',
        tooltip: 'New chat'
      });
    } else if (currentTheme === 'minimal') {
      baseButtons.push({
        id: 'new-chat',
        label: '',
        icon: '+',
        onClick: startNewChat,
        variant: 'primary',
        tooltip: 'New'
      });
    } else {
      baseButtons.push({
        id: 'new-chat',
        label: '',
        icon: <PlusIcon className="size-5" />,
        onClick: startNewChat,
        variant: 'primary',
        tooltip: 'Start a new conversation'
      });
    }
    
    // History button with theme-specific styling
    if (currentTheme === 'imessage') {
      baseButtons.push({
        id: 'history',
        label: '',
        icon: <HistoryIcon className="size-5" />,
        onClick: toggleHistory,
        variant: 'secondary',
        tooltip: showHistoryPanel ? 'Close' : 'History'
      });
    } else if (currentTheme === 'discord') {
      baseButtons.push({
        id: 'history',
        label: '',
        icon: <HistoryIcon className="size-5" />,
        onClick: toggleHistory,
        variant: 'secondary',
        tooltip: showHistoryPanel ? 'Close history' : 'Message history'
      });
    } else if (currentTheme === 'minimal') {
      baseButtons.push({
        id: 'history',
        label: '',
        icon: '⟨',
        onClick: toggleHistory,
        variant: 'secondary',
        tooltip: 'History'
      });
    } else {
      baseButtons.push({
        id: 'history',
        label: '',
        icon: <HistoryIcon className="size-5" />,
        onClick: toggleHistory,
        variant: 'secondary',
        tooltip: showHistoryPanel ? 'Close conversation history' : 'View conversation history'
      });
    }
    
    return baseButtons;
  };
  
  const headerButtons = getHeaderButtons();

  const settings = settingsManager.getSettings();
  const themeProvider = ThemeProvider.getInstance();
  const themeComponents = themeProvider.getComponents(currentTheme as ThemeName);

  // Show history view or chat view
  if (showHistoryPanel) {
    return (
      <div className={currentTheme === 'default' ? 'ai-chat-container' : `ai-chat-container-${currentTheme}`}>
        <themeComponents.HistoryPanel
          conversations={conversations.filter(conv =>
            conv.name.toLowerCase().includes(historySearchQuery.toLowerCase())
          )}
          searchQuery={historySearchQuery}
          isLoading={isLoadingConversations}
          error={conversationError}
          currentConversationId={currentConversationId}
          onSelectConversation={handleConversationSelect}
          onNewConversation={startNewChat}
          onClose={() => setShowHistoryPanel(false)}
          onDeleteConversation={handleDeleteConversation}
          onClearAllConversations={handleClearAllConversations}
          onSearchChange={setHistorySearchQuery}
          onRetry={loadConversations}
          maxHistoryToShow={settingsManager.getSettings().maxConversationHistory}
          formatDate={formatDate}
        />
      </div>
    );
  }

  // Normal chat view
  return (
    <div className={currentTheme === 'default' ? 'ai-chat-container' : `ai-chat-container-${currentTheme}`}>
      <themeComponents.Header
        name="AI Assistant"
        status={`Using: ${getProviderDisplayName(settings.aiProvider)}`}
        buttons={headerButtons}
        contextInfo={settings.enableContextTracking ? contextInfo : undefined}
      />
      
      <div className={currentTheme === 'default' ? 'ai-chat-messages' : `ai-chat-messages-${currentTheme}`}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center mb-4">
              <MessageIcon className="size-8 text-white" />
            </div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <themeComponents.Bubble
              key={message.id}
              message={message.isThinking ? 'Thinking...' : message.content}
              isUser={message.type === 'user'}
              timestamp={message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <themeComponents.Input
        onSend={handleSendMessage}
        placeholder="Ask me anything..."
        disabled={isProcessing}
      />
    </div>
  );
};