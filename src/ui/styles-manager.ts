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
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        
        .ai-chat-messages-imessage {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: var(--background-primary);
          scroll-behavior: smooth;
          display: flex;
          flex-direction: column;
          gap: 12px;
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
      /* Layout utilities */
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-end { align-items: flex-end; }
      .items-start { align-items: flex-start; }
      .items-center { align-items: center; }
      .items-baseline { align-items: baseline; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .flex-1 { flex: 1; }
      .flex-shrink-0 { flex-shrink: 0; }
      
      /* Spacing utilities */
      .gap-1 { gap: 0.25rem; }
      .gap-2 { gap: 0.5rem; }
      .gap-3 { gap: 0.75rem; }
      .p-1\\.5 { padding: 0.375rem; }
      .p-2 { padding: 0.5rem; }
      .p-3 { padding: 0.75rem; }
      .p-4 { padding: 1rem; }
      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
      .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .pr-12 { padding-right: 3rem; }
      .mt-1 { margin-top: 0.25rem; }
      .mb-4 { margin-bottom: 1rem; }
      
      /* Sizing utilities */
      .max-w-\\[80\\%\\] { max-width: 80%; }
      .h-10 { height: 2.5rem; }
      .w-10 { width: 2.5rem; }
      .h-16 { height: 4rem; }
      .w-16 { width: 4rem; }
      .h-full { height: 100%; }
      .w-full { width: 100%; }
      .w-4 { width: 1rem; }
      .h-4 { height: 1rem; }
      .min-h-\\[42px\\] { min-height: 42px; }
      .max-h-32 { max-height: 8rem; }
      
      /* Border utilities */
      .rounded-2xl { border-radius: 1rem; }
      .rounded-full { border-radius: 9999px; }
      .rounded-br-md { border-bottom-right-radius: 0.375rem; }
      .rounded-bl-md { border-bottom-left-radius: 0.375rem; }
      .border { border-width: 1px; }
      .border-t { border-top-width: 1px; }
      .border-b { border-bottom-width: 1px; }
      .border-border { border-color: var(--background-modifier-border); }
      
      /* Typography utilities */
      .text-\\[15px\\] { font-size: 15px; }
      .text-\\[12px\\] { font-size: 12px; }
      .text-\\[11px\\] { font-size: 11px; }
      .text-sm { font-size: 0.875rem; }
      .text-xs { font-size: 0.75rem; }
      .text-2xl { font-size: 1.5rem; }
      .leading-relaxed { line-height: 1.625; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .text-center { text-align: center; }
      
      /* Color utilities */
      .text-white { color: white; }
      .text-muted-foreground { color: var(--text-muted); }
      .text-foreground { color: var(--text-normal); }
      .bg-\\[\\#007AFF\\] { background-color: #007AFF; }
      .bg-\\[\\#E9E9EB\\] { background-color: #E9E9EB; }
      .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)); }
      .from-\\[\\#007AFF\\] { --tw-gradient-from: #007AFF; }
      .to-\\[\\#5856D6\\] { --tw-gradient-to: #5856D6; }
      .bg-background\\/80 { background-color: rgba(var(--background-primary-rgb), 0.8); }
      .bg-muted\\/50 { background-color: rgba(var(--background-secondary-rgb), 0.5); }
      
      /* Position utilities */
      .absolute { position: absolute; }
      .relative { position: relative; }
      .right-2 { right: 0.5rem; }
      .bottom-1\\.5 { bottom: 0.375rem; }
      
      /* Other utilities */
      .backdrop-blur-xl { backdrop-filter: blur(24px); }
      .resize-none { resize: none; }
      .transition-all { transition-property: all; }
      .duration-200 { transition-duration: 200ms; }
      
      /* Focus utilities */
      .focus\\:outline-none:focus { outline: none; }
      .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.3); }
      .focus\\:ring-\\[\\#007AFF\\]\\/50:focus { box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5); }
      .focus\\:border-\\[\\#007AFF\\]:focus { border-color: #007AFF; }
      
      /* Hover utilities */
      .hover\\:bg-\\[\\#0066CC\\]:hover { background-color: #0066CC; }
      .hover\\:text-\\[\\#0066CC\\]:hover { color: #0066CC; }
      .hover\\:bg-gray-100:hover { background-color: rgba(var(--background-modifier-hover-rgb), 1); }
      .hover\\:bg-gray-700:hover { background-color: rgba(var(--background-modifier-hover-rgb), 1); }
      
      /* Dark theme overrides */
      .dark .dark\\:bg-\\[\\#3A3A3C\\] { background-color: #3A3A3C; }
      .dark .dark\\:text-white { color: white; }
      .dark .dark\\:hover\\:bg-gray-700:hover { background-color: rgba(55, 65, 81, 1); }
      
      /* Placeholder utilities */
      .placeholder\\:text-muted-foreground::placeholder { color: var(--text-muted); }
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