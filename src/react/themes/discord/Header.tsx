import React from 'react';
import { ChatHeaderProps } from '../types';

export function DiscordHeader({ name, status = "AI Assistant", onClear }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="text-gray-600 dark:text-gray-400">#</div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{status}</span>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}