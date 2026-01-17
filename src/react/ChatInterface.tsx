import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAIService, useSettings } from './context';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const aiService = useAIService();
  const settingsManager = useSettings();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isProcessing) return;

    console.log("=== REACT CHAT: Starting message send ===");
    console.log("Chat message:", message);

    setIsProcessing(true);
    setInputValue('');

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
      
      // Pass current messages as chat history for context
      const chatHistory = messages.filter(msg => !msg.isThinking);
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const processMessageContent = (content: string): string => {
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  const clearChat = () => {
    const settings = settingsManager.getSettings();
    const providerName = getProviderDisplayName(settings.aiProvider);
    
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: `Hello! I'm your AI assistant powered by ${providerName}. You can ask me questions about your notes, request help with tasks, or just chat. I have access to your vault context and can help with various tasks.`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <h3 className="ai-chat-title">AI Assistant</h3>
        <div className="ai-chat-provider-label">
          Using: {getProviderDisplayName(settingsManager.getSettings().aiProvider)}
        </div>
        <button 
          className="ai-chat-clear-btn"
          onClick={clearChat}
          title="Clear chat history"
        >
          Clear
        </button>
      </div>
      
      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`ai-chat-message ai-chat-message-${message.type}`}
          >
            <div className="ai-chat-message-label">
              {message.type === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div
              className={`ai-chat-message-content ${message.isThinking ? 'ai-chat-thinking' : ''}`}
              dangerouslySetInnerHTML={{
                __html: message.isThinking
                  ? '<div class="ai-chat-thinking-dots"><span></span><span></span><span></span></div>Thinking...'
                  : processMessageContent(message.content)
              }}
            />
            <div className="ai-chat-timestamp">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="ai-chat-input-container">
        <textarea
          ref={textareaRef}
          className="ai-chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={isProcessing}
        />
        <button
          className="ai-chat-send-btn"
          onClick={handleSendMessage}
          disabled={isProcessing || !inputValue.trim()}
          title={isProcessing ? "Sending message..." : "Send message (Enter)"}
        >
          {isProcessing ? (
            <div className="ai-chat-spinner"></div>
          ) : (
            '✈️'
          )}
        </button>
      </div>
    </div>
  );
};