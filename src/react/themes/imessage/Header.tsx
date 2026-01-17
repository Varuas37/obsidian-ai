import React from 'react';
import { ChatHeaderProps } from '../types';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function iMessageHeader({ name, status = "AI Assistant", buttons = [], contextInfo }: ChatHeaderProps) {
  return (
    <div className="flex flex-col border-b border-border bg-background/80 backdrop-blur-xl">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white text-sm font-medium flex items-center justify-center">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-foreground">{name}</span>
            <span className="text-[12px] text-muted-foreground">{status}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {buttons.map(button => (
            <button
              key={button.id}
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip || button.label}
              className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                button.variant === 'primary'
                  ? 'bg-[#007AFF] text-white hover:bg-[#0066CC]'
                  : button.variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-[#007AFF] hover:text-[#0066CC] hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {button.icon}
              {button.label && <span className="ml-1">{button.label}</span>}
            </button>
          ))}
        </div>
      </div>
      
      {/* Context info bar */}
      {contextInfo && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              {contextInfo.currentWords.toLocaleString()}/{contextInfo.maxWords.toLocaleString()} words
            </span>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(contextInfo.percentage, 100)}%`,
                  background: contextInfo.percentage > 90
                    ? 'linear-gradient(90deg, #ff4444, #ff6666)'
                    : contextInfo.percentage > 70
                    ? 'linear-gradient(90deg, #ff8800, #ffaa44)'
                    : 'linear-gradient(90deg, #007AFF, #5856D6)'
                }}
              />
            </div>
            <span>{contextInfo.percentage.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}