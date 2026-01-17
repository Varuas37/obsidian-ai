import React from 'react';
import { ChatHeaderProps } from '../types';

export function MinimalHeader({ name, status = "AI Assistant", buttons = [], contextInfo }: ChatHeaderProps) {
  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-gray-700">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
            {status && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{status}</span>
            )}
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
              className={`px-2 py-1 text-xs rounded transition-colors ${
                button.variant === 'primary'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : button.variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {button.icon && <span className="mr-1">{button.icon}</span>}
              {button.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Context info bar */}
      {contextInfo && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {contextInfo.currentWords.toLocaleString()}/{contextInfo.maxWords.toLocaleString()} words
            </span>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(contextInfo.percentage, 100)}%`,
                  backgroundColor: contextInfo.percentage > 90 ? '#ef4444' : contextInfo.percentage > 70 ? '#f59e0b' : '#10b981'
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