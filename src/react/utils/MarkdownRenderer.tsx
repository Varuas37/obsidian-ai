import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  showCopyButton?: boolean;
  className?: string;
}

/**
 * Shared markdown renderer component with copy functionality
 * Handles markdown rendering and provides copy-to-clipboard feature
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  showCopyButton = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`markdown-renderer-container ${className}`}>
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            // Custom components for better styling
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              return isInline ? (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="code-block">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="markdown-blockquote">
                {children}
              </blockquote>
            ),
            h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
            h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
            h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
            h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
            h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
            h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
            ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
            ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
            li: ({ children }) => <li className="markdown-li">{children}</li>,
            p: ({ children }) => <p className="markdown-p">{children}</p>,
            a: ({ href, children }) => (
              <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
            em: ({ children }) => <em className="markdown-em">{children}</em>,
            table: ({ children }) => <table className="markdown-table">{children}</table>,
            thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
            tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
            tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
            th: ({ children }) => <th className="markdown-th">{children}</th>,
            td: ({ children }) => <td className="markdown-td">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className={`copy-button ${copied ? 'copied' : ''}`}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            top: 'unset'
          }}
        >
          {copied ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      )}
    </div>
  );
};