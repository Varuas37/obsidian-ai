import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAIService, useSettings } from './context';
import { ChatBubble } from './themed-components/ChatBubble';
import { ChatHeader } from './themed-components/ChatHeader';
import { ChatInput } from './themed-components/ChatInput';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const aiService = useAIService();
  const settingsManager = useSettings();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const settings = settingsManager.getSettings();

  return (
    <div className={currentTheme === 'default' ? 'ai-chat-container' : `ai-chat-container-${currentTheme}`}>
      <ChatHeader
        name="AI Assistant"
        status={`Using: ${getProviderDisplayName(settings.aiProvider)}`}
        onClear={clearChat}
        theme={currentTheme as any}
      />
      
      <div className={currentTheme === 'default' ? 'ai-chat-messages' : `ai-chat-messages-${currentTheme}`}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center mb-4">
              <span className="text-2xl text-white">💬</span>
            </div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.isThinking ? 'Thinking...' : message.content}
              isUser={message.type === 'user'}
              timestamp={message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              theme={currentTheme as any}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        onSend={handleSendMessage}
        placeholder="Ask me anything..."
        disabled={isProcessing}
        theme={currentTheme as any}
      />
    </div>
  );
};