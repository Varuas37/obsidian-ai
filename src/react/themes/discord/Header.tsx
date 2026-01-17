import React from 'react';
import { ChatHeaderProps } from '../types';

export function DiscordHeader({ name, status = "AI Assistant", buttons = [], contextInfo }: ChatHeaderProps) {
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-gray-600 dark:text-gray-400 text-lg">#</div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{status}</span>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {buttons.map(button => (
            <button
              key={button.id}
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.tooltip || button.label}
              className={`text-sm px-3 py-1.5 rounded transition-colors font-medium ${
                button.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : button.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {contextInfo.currentWords.toLocaleString()}/{contextInfo.maxWords.toLocaleString()} words
            </span>
            <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded"
                style={{
                  width: `${Math.min(contextInfo.percentage, 100)}%`,
                  backgroundColor: contextInfo.percentage > 90
                    ? '#dc2626'
                    : contextInfo.percentage > 70
                    ? '#ea580c'
                    : '#2563eb'
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