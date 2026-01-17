import React from 'react';
import { ChatHeaderProps } from '../types';

export function MinimalHeader({ name, status = "AI Assistant", onClear }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}