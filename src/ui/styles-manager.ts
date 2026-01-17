/**
 * Styles Manager - Beautiful Chat Interface Styling
 * Professional, modern chat UI with proper visual hierarchy
 */

export class StylesManager {
  private styleElements = new Map<string, HTMLStyleElement>();

  /**
   * Initialize all plugin styles
   */
  initializeStyles(): void {
    this.addChatStyles();
    this.addHistoryStyles();
    this.addAnimations();
    this.addResponsiveStyles();
    this.addThemeStyles();
    this.addTailwindUtilities();
  }

  /**
   * Add beautiful chat interface styles
   */
  private addChatStyles(): void {
    const styleId = 'ai-chat-styles';
    const styles = `
      .ai-chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--background-primary);
        font-family: var(--font-interface);
        position: relative;
      }
      
      .ai-chat-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, var(--background-secondary), var(--background-modifier-border));
        border-bottom: 1px solid var(--background-modifier-border);
        position: relative;
        z-index: 10;
      }
      
      .ai-chat-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-normal);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ai-chat-title::before {
        content: "🤖";
        font-size: 20px;
      }
      
      .ai-chat-provider-label {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 4px;
        opacity: 0.8;
        font-weight: 500;
      }
      
      .ai-chat-clear-btn {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
        background: var(--interactive-normal);
        border: 1px solid var(--background-modifier-border);
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        color: var(--text-normal);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .ai-chat-clear-btn:hover {
        background: var(--interactive-hover);
        transform: translateY(-50%) scale(1.05);
      }
      
      .ai-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: var(--background-primary);
        scroll-behavior: smooth;
      }
      
      .ai-chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      
      .ai-chat-messages::-webkit-scrollbar-track {
        background: var(--background-modifier-border);
        border-radius: 3px;
      }
      
      .ai-chat-messages::-webkit-scrollbar-thumb {
        background: var(--text-muted);
        border-radius: 3px;
      }
      
      .ai-chat-messages::-webkit-scrollbar-thumb:hover {
        background: var(--text-normal);
      }
      
      .ai-chat-message {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 85%;
        opacity: 0;
        animation: messageSlideIn 0.4s ease forwards;
      }
      
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .ai-chat-message-user {
        align-self: flex-end;
        align-items: flex-end;
      }
      
      .ai-chat-message-assistant {
        align-self: flex-start;
        align-items: flex-start;
      }
      
      .ai-chat-message-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 4px;
        padding: 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .ai-chat-message-content {
        padding: 12px 16px;
        border-radius: 8px;
        line-height: 1.6;
        font-size: 14px;
        position: relative;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      
      .ai-chat-message-content:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
      }
      
      .ai-chat-message-user .ai-chat-message-content {
        background: linear-gradient(135deg, var(--interactive-accent), var(--interactive-accent-hover));
        color: var(--text-on-accent);
        border-bottom-right-radius: 4px;
        position: relative;
      }
      
      .ai-chat-message-user .ai-chat-message-content::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: -8px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-left-color: var(--interactive-accent);
        border-bottom: none;
        border-right: none;
      }
      
      .ai-chat-message-assistant .ai-chat-message-content {
        background: var(--background-secondary);
        color: var(--text-normal);
        border: 1px solid var(--background-modifier-border);
        border-bottom-left-radius: 4px;
        position: relative;
      }
      
      .ai-chat-message-assistant .ai-chat-message-content::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -9px;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-right-color: var(--background-secondary);
        border-bottom: none;
        border-left: none;
      }
      
      .ai-chat-message-content strong {
        font-weight: 600;
        color: inherit;
      }
      
      .ai-chat-message-content em {
        font-style: italic;
        opacity: 0.9;
      }
      
      .ai-chat-message-content code {
        background: var(--code-background);
        border: 1px solid var(--background-modifier-border);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--font-monospace);
        font-size: 0.9em;
        color: var(--text-accent);
      }
      
      .ai-chat-message-content pre {
        background: var(--code-background);
        border: 1px solid var(--background-modifier-border);
        padding: 12px;
        border-radius: 8px;
        font-family: var(--font-monospace);
        font-size: 0.9em;
        overflow-x: auto;
        margin: 8px 0;
      }
      
      .ai-chat-thinking {
        font-style: italic;
        opacity: 0.8;
        background: linear-gradient(90deg, var(--background-modifier-border), var(--background-secondary), var(--background-modifier-border));
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .ai-chat-thinking-dots {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }
      
      .ai-chat-thinking-dots span {
        width: 6px;
        height: 6px;
        background: currentColor;
        border-radius: 50%;
        animation: thinkingPulse 1.5s infinite ease-in-out;
      }
      
      .ai-chat-thinking-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .ai-chat-thinking-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes thinkingPulse {
        0%, 60%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        30% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .ai-chat-input-container {
        padding: 24px 20px;
        background: var(--background-primary);
        border-top: 1px solid var(--background-modifier-border);
        display: flex;
        gap: 12px;
        align-items: center;
        position: relative;
        justify-content: center;
      }
      
      .ai-chat-input-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--interactive-accent), transparent);
        opacity: 0.3;
      }
      
      .ai-chat-input {
        flex: 1;
        min-height: 52px;
        max-height: 120px;
        padding: 16px 24px;
        border: 2px solid var(--interactive-accent);
        border-radius: 26px;
        background: var(--background-primary);
        color: var(--text-normal);
        font-family: var(--font-interface);
        font-size: 15px;
        resize: none;
        outline: none;
        transition: all 0.3s ease;
        line-height: 1.5;
        box-shadow: 0 2px 12px rgba(var(--interactive-accent-rgb), 0.15);
      }
      
      .ai-chat-input:focus {
        border-color: var(--interactive-accent);
        background: var(--background-primary);
        box-shadow: 0 0 0 3px rgba(var(--interactive-accent-rgb), 0.1);
        transform: translateY(-1px);
      }
      
      .ai-chat-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: var(--background-modifier-border);
      }
      
      .ai-chat-input::placeholder {
        color: var(--text-muted);
        opacity: 0.7;
      }
      
      .ai-chat-send-btn {
        padding: 12px 16px;
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s ease;
        min-width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .ai-chat-send-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }
      
      .ai-chat-send-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--interactive-accent-hover), var(--interactive-accent));
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 4px 16px rgba(var(--interactive-accent-rgb), 0.3);
      }
      
      .ai-chat-send-btn:hover::before {
        left: 100%;
      }
      
      .ai-chat-send-btn:active {
        transform: translateY(-1px) scale(0.98);
      }
      
      .ai-chat-send-btn:disabled {
        background: var(--background-modifier-border);
        color: var(--text-muted);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      
      .ai-chat-empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
        font-style: italic;
      }
      
      .ai-chat-timestamp {
        font-size: 10px;
        color: var(--text-faint);
        margin-top: 4px;
        padding: 0 8px;
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add conversation history panel styles - No Modal Styling
   */
  private addHistoryStyles(): void {
    const styleId = 'ai-chat-history';
    const styles = `
      /* Conversation History Panel - True Full Screen */
      .conversation-history-panel {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        background: var(--background-primary) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        position: relative !important;
        box-shadow: none !important;
      }
      
      /* Loading spinner for history panel */
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add smooth animations and transitions
   */
  private addAnimations(): void {
    const styleId = 'ai-chat-animations';
    const styles = `
      @keyframes messageAppear {
        0% {
          opacity: 0;
          transform: translateY(15px) scale(0.95);
          filter: blur(1px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }
      
      @keyframes typingIndicator {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
      
      @keyframes buttonPulse {
        0% { box-shadow: 0 0 0 0 rgba(var(--interactive-accent-rgb), 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(var(--interactive-accent-rgb), 0); }
        100% { box-shadow: 0 0 0 0 rgba(var(--interactive-accent-rgb), 0); }
      }
      
      .ai-chat-message {
        animation: messageAppear 0.5s ease-out forwards;
      }
      
      .ai-chat-send-btn:focus {
        animation: buttonPulse 2s infinite;
      }
      
      .ai-chat-thinking .ai-chat-thinking-dots {
        animation: typingIndicator 1.5s infinite ease-in-out;
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add responsive styles for different screen sizes
   */
  private addResponsiveStyles(): void {
    const styleId = 'ai-chat-responsive';
    const styles = `
      @media (max-width: 768px) {
        .ai-chat-message {
          max-width: 90%;
        }
        
        .ai-chat-input-container {
          padding: 12px 16px 16px;
          gap: 8px;
        }
        
        .ai-chat-header {
          padding: 12px 16px;
        }
        
        .ai-chat-messages {
          padding: 16px 12px;
          gap: 12px;
        }
        
        .ai-chat-send-btn {
          min-width: 60px;
          padding: 12px 16px;
        }
      }
      
      @media (max-width: 480px) {
        .ai-chat-message {
          max-width: 95%;
        }
        
        .ai-chat-send-btn {
          padding: 12px;
          font-size: 13px;
        }
        
        .ai-chat-input {
          font-size: 13px;
          padding: 10px 14px;
        }
        
        .ai-chat-title {
          font-size: 16px;
        }
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add theme-specific improvements
   */
  private addThemeStyles(): void {
    const styleId = 'ai-chat-theme';
    const styles = `
      /* Dark theme enhancements */
      .theme-dark .ai-chat-message-assistant .ai-chat-message-content {
        background: var(--background-secondary);
        border-color: var(--background-modifier-border-hover);
      }
      
      .theme-dark .ai-chat-message-user .ai-chat-message-content {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
      }
      
      .theme-dark .ai-chat-header {
        background: linear-gradient(135deg, var(--background-secondary), var(--background-modifier-border));
      }
      
      /* Light theme enhancements */
      .theme-light .ai-chat-message-user .ai-chat-message-content {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .theme-light .ai-chat-message-assistant .ai-chat-message-content {
        background: #ffffff;
        border-color: #e1e5e9;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
      
      .theme-light .ai-chat-header {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border-bottom-color: #dee2e6;
      }
      
      /* High contrast mode */
      .theme-dark.is-high-contrast .ai-chat-message-content {
        border-width: 2px;
      }
      
      .theme-light.is-high-contrast .ai-chat-message-content {
        border-width: 2px;
        border-color: var(--background-modifier-border-focus);
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add accessibility improvements
   */
  private addAccessibilityStyles(): void {
    const styleId = 'ai-chat-a11y';
    const styles = `
      .ai-chat-message:focus-within {
        outline: 2px solid var(--interactive-accent);
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      .ai-chat-send-btn:focus-visible {
        outline: 2px solid var(--text-on-accent);
        outline-offset: 2px;
      }
      
      .ai-chat-input:focus-visible {
        outline: none; /* Custom focus styling applied above */
      }
      
      @media (prefers-reduced-motion: reduce) {
        .ai-chat-message,
        .ai-chat-send-btn,
        .ai-chat-input {
          animation: none;
          transition: none;
        }
      }
      
      .ai-chat-message-content[aria-live="polite"] {
        /* For screen readers */
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add custom loading states
   */
  private addLoadingStyles(): void {
    const styleId = 'ai-chat-loading';
    const styles = `
      .ai-chat-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      
      .ai-chat-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--background-modifier-border);
        border-top-color: var(--interactive-accent);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .ai-chat-error {
        background: var(--background-modifier-error);
        color: var(--text-error);
        border: 1px solid var(--background-modifier-error-hover);
        padding: 12px 16px;
        border-radius: 8px;
        margin: 8px 0;
        font-size: 13px;
      }
      
      .ai-chat-error::before {
        content: "⚠️ ";
        margin-right: 6px;
      }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Add a style element to the document
   */
  private addStyleElement(id: string, styles: string): void {
    this.removeStyleElement(id);
    
    const style = document.createElement('style');
    style.id = id;
    style.textContent = styles;
    document.head.appendChild(style);
    
    this.styleElements.set(id, style);
  }

  /**
   * Remove a style element
   */
  private removeStyleElement(id: string): void {
    const existing = this.styleElements.get(id);
    if (existing) {
      existing.remove();
      this.styleElements.delete(id);
    }
  }

  /**
   * Apply settings-based styles including themes
   */
  applySettingsBasedStyles(settings: any): void {
    // Panel position styles
    if (settings.chatPanelSide === 'left') {
      this.addStyleElement('ai-panel-position', `
        .workspace-split.mod-left-split .ai-chat-container {
          border-right: 1px solid var(--background-modifier-border);
        }
      `);
    } else {
      this.addStyleElement('ai-panel-position', `
        .workspace-split.mod-right-split .ai-chat-container {
          border-left: 1px solid var(--background-modifier-border);
        }
      `);
    }

    // Apply theme-specific styles
    this.applyThemeStyles(settings.chatTheme || 'default');
  }

  /**
   * Apply theme-specific styles
   */
  private applyThemeStyles(theme: string): void {
    // Remove existing theme styles
    this.removeStyleElement('ai-theme-styles');

    if (theme === 'default') {
      // Default theme uses existing styles
      return;
    }

    let themeStyles = '';

    if (theme === 'imessage') {
      themeStyles = `
        .ai-chat-container-imessage {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          background: var(--background-primary) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
        }
        
        .ai-chat-messages-imessage {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 16px !important;
          background: var(--background-primary) !important;
          scroll-behavior: smooth !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
        
        /* iMessage Header */
        .imessage-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--background-modifier-border);
          background: rgba(var(--background-secondary-rgb), 0.8);
          backdrop-filter: blur(24px);
        }
        
        .imessage-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .imessage-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007AFF, #5856D6);
          color: white;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .imessage-header-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-normal);
          margin: 0 0 2px 0;
        }
        
        .imessage-header-info span {
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .imessage-clear-btn {
          background: none;
          border: none;
          color: #007AFF;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .imessage-clear-btn:hover {
          background-color: rgba(0, 122, 255, 0.1);
        }
        
        /* iMessage Bubbles */
        .imessage-bubble-container {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          gap: 4px;
        }
        
        .imessage-bubble-container.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        
        .imessage-bubble-container.assistant {
          align-self: flex-start;
          align-items: flex-start;
        }
        
        .imessage-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.4;
          word-wrap: break-word;
          max-width: 100%;
        }
        
        .imessage-bubble.user {
          background-color: #007AFF;
          color: white;
          border-bottom-right-radius: 6px;
        }
        
        .imessage-bubble.assistant {
          background-color: #E9E9EB;
          color: #000;
          border-bottom-left-radius: 6px;
        }
        
        .theme-dark .imessage-bubble.assistant {
          background-color: #3A3A3C;
          color: #fff;
        }
        
        .imessage-timestamp {
          font-size: 11px;
          color: var(--text-muted);
          padding: 0 8px;
          margin-top: 2px;
        }
        
        /* iMessage Input */
        .imessage-input-container {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--background-modifier-border);
          background: rgba(var(--background-primary-rgb), 0.8);
          backdrop-filter: blur(24px);
        }
        
        .imessage-input-wrapper {
          position: relative;
          flex: 1;
        }
        
        .imessage-input {
          width: 100%;
          resize: none;
          border-radius: 21px;
          border: 1px solid var(--background-modifier-border);
          background: var(--background-secondary);
          padding: 10px 16px 10px 16px;
          padding-right: 44px;
          font-size: 15px;
          color: var(--text-normal);
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          min-height: 42px;
          max-height: 128px;
        }
        
        .imessage-input:focus {
          border-color: #007AFF;
          background: var(--background-primary);
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }
        
        .imessage-input::placeholder {
          color: var(--text-muted);
        }
        
        .imessage-send-btn {
          position: absolute;
          right: 6px;
          bottom: 6px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background-color: #007AFF;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          font-size: 14px;
        }
        
        .imessage-send-btn:hover:not(:disabled) {
          background-color: #0066CC;
        }
        
        .imessage-send-btn:disabled {
          background-color: var(--background-modifier-border);
          cursor: not-allowed;
        }
        
        /* Empty state */
        .imessage-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
        }
        
        .imessage-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007AFF, #5856D6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 16px;
        }
      `;
    } else if (theme === 'minimal') {
      themeStyles = `
        .ai-chat-container-minimal {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background-primary);
          font-family: var(--font-interface);
          border: 1px solid var(--background-modifier-border);
        }
        
        .ai-chat-messages-minimal {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          space-y: 8px;
          background: var(--background-primary);
        }
        
        .ai-chat-messages-minimal > * + * {
          margin-top: 8px;
        }
        
        /* Additional minimal theme utilities */
        .text-gray-100 { color: var(--text-faint); }
        .text-gray-300 { color: var(--text-muted); }
        .text-gray-500 { color: var(--text-muted); }
        .text-gray-700 { color: var(--text-normal); }
        .text-gray-900 { color: var(--text-normal); }
        .bg-gray-100 { background-color: var(--background-secondary); }
        .bg-gray-800 { background-color: var(--background-secondary); }
        .border-gray-200 { border-color: var(--background-modifier-border); }
        .border-gray-700 { border-color: var(--background-modifier-border); }
        .border-l-2 { border-left-width: 2px; }
        .border-blue-500 { border-color: var(--interactive-accent); }
        .bg-green-500 { background-color: #10b981; }
        .w-2 { width: 0.5rem; }
        .h-2 { height: 0.5rem; }
        .pl-3 { padding-left: 0.75rem; }
        .hover\\:text-gray-700:hover { color: var(--text-normal); }
        .hover\\:text-gray-300:hover { color: var(--text-muted); }
        .hover\\:text-blue-700:hover { color: var(--interactive-accent-hover); }
        .text-blue-500 { color: var(--interactive-accent); }
        .disabled\\:text-gray-400:disabled { color: var(--text-faint); }
        .bg-transparent { background-color: transparent; }
        .placeholder\\:text-gray-400::placeholder { color: var(--text-muted); }
        .min-h-\\[20px\\] { min-height: 20px; }
      `;
    } else if (theme === 'discord') {
      themeStyles = `
        .ai-chat-container-discord {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background-primary);
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        
        .ai-chat-messages-discord {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          space-y: 8px;
          background: var(--background-primary);
        }
        
        .ai-chat-messages-discord > * + * {
          margin-top: 8px;
        }
        
        /* Discord theme utilities */
        .bg-gray-50 { background-color: var(--background-secondary); }
        .bg-gray-800 { background-color: var(--background-secondary); }
        .bg-white { background-color: var(--background-primary); }
        .bg-gray-700 { background-color: var(--background-secondary); }
        .border-gray-300 { border-color: var(--background-modifier-border); }
        .border-gray-600 { border-color: var(--background-modifier-border); }
        .w-px { width: 1px; }
        .h-6 { height: 1.5rem; }
        .bg-gray-300 { background-color: var(--background-modifier-border); }
        .bg-gray-600 { background-color: var(--background-modifier-border); }
        .text-gray-600 { color: var(--text-muted); }
        .text-gray-400 { color: var(--text-muted); }
        .text-gray-500 { color: var(--text-muted); }
        .hover\\:text-gray-700:hover { color: var(--text-normal); }
        .hover\\:text-gray-300:hover { color: var(--text-muted); }
        .hover\\:bg-gray-200:hover { background-color: var(--background-modifier-hover); }
        .hover\\:bg-gray-700:hover { background-color: var(--background-modifier-hover); }
        .bg-blue-500 { background-color: var(--interactive-accent); }
        .hover\\:bg-blue-600:hover { background-color: var(--interactive-accent-hover); }
        .disabled\\:bg-gray-400:disabled { background-color: var(--text-faint); }
        .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
        .placeholder\\:text-gray-500::placeholder { color: var(--text-muted); }
        .placeholder\\:text-gray-400::placeholder { color: var(--text-muted); }
        .p-4 { padding: 1rem; }
        .p-2 { padding: 0.5rem; }
        .rounded-md { border-radius: 0.375rem; }
        .flex-shrink-0 { flex-shrink: 0; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
        .from-blue-500 { --tw-gradient-from: var(--interactive-accent); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(var(--interactive-accent-rgb), 0)); }
        .to-purple-600 { --tw-gradient-to: #9333ea; }
        .items-baseline { align-items: baseline; }
        .flex-1 { flex: 1; }
      `;
    }

    if (themeStyles) {
      this.addStyleElement('ai-theme-styles', themeStyles);
    }
  }

  /**
   * Add Tailwind-like utility classes for themed components
   */
  private addTailwindUtilities(): void {
    const styleId = 'ai-tailwind-utilities';
    const styles = `
      /* Layout utilities with !important */
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .items-end { align-items: flex-end !important; }
      .items-start { align-items: flex-start !important; }
      .items-center { align-items: center !important; }
      .items-baseline { align-items: baseline !important; }
      .justify-between { justify-content: space-between !important; }
      .justify-center { justify-content: center !important; }
      .flex-1 { flex: 1 !important; }
      .flex-shrink-0 { flex-shrink: 0 !important; }
      
      /* Spacing utilities with !important */
      .gap-1 { gap: 0.25rem !important; }
      .gap-2 { gap: 0.5rem !important; }
      .gap-3 { gap: 0.75rem !important; }
      .gap-4 { gap: 1rem !important; }
      .p-1\\.5 { padding: 0.375rem !important; }
      .p-2 { padding: 0.5rem !important; }
      .p-3 { padding: 0.75rem !important; }
      .p-4 { padding: 1rem !important; }
      .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
      .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
      .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
      .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
      .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
      .py-2\\.5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
      .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
      .pl-4 { padding-left: 1rem !important; }
      .pr-4 { padding-right: 1rem !important; }
      .pr-12 { padding-right: 3rem !important; }
      .pr-14 { padding-right: 3.5rem !important; }
      .mt-1 { margin-top: 0.25rem !important; }
      .mb-1 { margin-bottom: 0.25rem !important; }
      .mb-4 { margin-bottom: 1rem !important; }
      
      /* Additional utilities for Discord theme */
      .bg-gray-100 { background-color: var(--background-secondary) !important; }
      .focus\\:ring-blue-500:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important; }
      .rounded { border-radius: 0.25rem !important; }
      
      /* Sizing utilities with !important */
      .max-w-\\[80\\%\\] { max-width: 80% !important; }
      .min-w-0 { min-width: 0 !important; }
      .h-8 { height: 2rem !important; }
      .w-8 { width: 2rem !important; }
      .h-10 { height: 2.5rem !important; }
      .w-10 { width: 2.5rem !important; }
      .h-16 { height: 4rem !important; }
      .w-16 { width: 4rem !important; }
      .h-full { height: 100% !important; }
      .w-full { width: 100% !important; }
      .w-4 { width: 1rem !important; }
      .h-4 { height: 1rem !important; }
      .min-h-\\[42px\\] { min-height: 42px !important; }
      .max-h-32 { max-height: 8rem !important; }
      
      /* Border utilities with !important */
      .rounded-2xl { border-radius: 1rem !important; }
      .rounded-full { border-radius: 9999px !important; }
      .rounded-br-md { border-bottom-right-radius: 0.375rem !important; }
      .rounded-bl-md { border-bottom-left-radius: 0.375rem !important; }
      .border { border-width: 1px !important; }
      .border-t { border-top-width: 1px !important; }
      .border-b { border-bottom-width: 1px !important; }
      .border-border { border-color: var(--background-modifier-border) !important; }
      
      /* Typography utilities with !important */
      .text-\\[15px\\] { font-size: 15px !important; }
      .text-\\[12px\\] { font-size: 12px !important; }
      .text-\\[11px\\] { font-size: 11px !important; }
      .text-sm { font-size: 0.875rem !important; }
      .text-xs { font-size: 0.75rem !important; }
      .text-2xl { font-size: 1.5rem !important; }
      .leading-relaxed { line-height: 1.625 !important; }
      .font-semibold { font-weight: 600 !important; }
      .font-medium { font-weight: 500 !important; }
      .text-center { text-align: center !important; }
      
      /* Color utilities with !important */
      .text-white { color: white !important; }
      .text-black { color: black !important; }
      .text-muted-foreground { color: var(--text-muted) !important; }
      .text-foreground { color: var(--text-normal) !important; }
      .bg-\\[\\#007AFF\\] { background-color: #007AFF !important; }
      .bg-\\[\\#E9E9EB\\] { background-color: #E9E9EB !important; }
      .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)) !important; }
      .from-\\[\\#007AFF\\] { --tw-gradient-from: #007AFF !important; }
      .to-\\[\\#5856D6\\] { --tw-gradient-to: #5856D6 !important; }
      .bg-background\\/80 { background-color: rgba(var(--background-primary-rgb), 0.8) !important; }
      .bg-muted\\/50 { background-color: rgba(var(--background-secondary-rgb), 0.5) !important; }
      
      /* Position utilities with !important */
      .absolute { position: absolute !important; }
      .relative { position: relative !important; }
      .right-2 { right: 0.5rem !important; }
      .bottom-1\\.5 { bottom: 0.375rem !important; }
      
      /* Transform utilities with !important */
      .-translate-y-1\\/2 { transform: translateY(-50%) !important; }
      .top-1\\/2 { top: 50% !important; }
      .right-1\\.5 { right: 0.375rem !important; }
      
      /* Background utilities with !important */
      .bg-gray-50 { background-color: var(--background-secondary) !important; }
      .bg-gray-300 { background-color: var(--background-modifier-border) !important; }
      .bg-gray-600 { background-color: var(--background-modifier-border) !important; }
      
      /* Text color utilities with !important */
      .text-gray-400 { color: var(--text-muted) !important; }
      .text-gray-500 { color: var(--text-muted) !important; }
      .text-gray-800 { color: var(--text-normal) !important; }
      .text-gray-900 { color: var(--text-normal) !important; }
      
      /* Cursor utilities */
      .cursor-not-allowed { cursor: not-allowed !important; }
      
      /* Hover utilities with !important */
      .hover\\:bg-gray-50:hover { background-color: var(--background-modifier-hover) !important; }
      .hover\\:bg-gray-800:hover { background-color: var(--background-modifier-hover) !important; }
      .hover\\:scale-105:hover { transform: scale(1.05) !important; }
      
      /* Other utilities with !important */
      .backdrop-blur-xl { backdrop-filter: blur(24px) !important; }
      .resize-none { resize: none !important; }
      .transition-all { transition-property: all !important; }
      .transition-colors { transition-property: color, background-color, border-color !important; }
      .duration-200 { transition-duration: 200ms !important; }
      
      /* Focus utilities with !important */
      .focus\\:outline-none:focus { outline: none !important; }
      .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.3) !important; }
      .focus\\:ring-\\[\\#007AFF\\]\\/50:focus { box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5) !important; }
      .focus\\:border-\\[\\#007AFF\\]:focus { border-color: #007AFF !important; }
      
      /* Hover utilities with !important */
      .hover\\:bg-\\[\\#0066CC\\]:hover { background-color: #0066CC !important; }
      .hover\\:text-\\[\\#0066CC\\]:hover { color: #0066CC !important; }
      .hover\\:bg-gray-100:hover { background-color: rgba(var(--background-modifier-hover-rgb), 1) !important; }
      .hover\\:bg-gray-700:hover { background-color: rgba(var(--background-modifier-hover-rgb), 1) !important; }
      
      /* Dark theme overrides with !important */
      .dark .dark\\:bg-\\[\\#3A3A3C\\] { background-color: #3A3A3C !important; }
      .dark .dark\\:text-white { color: white !important; }
      .dark .dark\\:hover\\:bg-gray-700:hover { background-color: rgba(55, 65, 81, 1) !important; }
      
      /* Placeholder utilities with !important */
      .placeholder\\:text-muted-foreground::placeholder { color: var(--text-muted) !important; }
    `;
    
    this.addStyleElement(styleId, styles);
  }

  /**
   * Initialize all styles including accessibility
   */
  initializeAllStyles(): void {
    this.initializeStyles();
    this.addAccessibilityStyles();
    this.addLoadingStyles();
  }

  /**
   * Clean up all styles
   */
  cleanup(): void {
    for (const [id, element] of this.styleElements) {
      element.remove();
    }
    this.styleElements.clear();
  }
}