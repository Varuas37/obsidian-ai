import React from 'react';
import { ChatHeaderProps } from '../types';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function iMessageHeader({ name, status = "AI Assistant", onClear }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white text-sm font-medium flex items-center justify-center">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[15px] text-foreground">{name}</span>
          <span className="text-[12px] text-muted-foreground">{status}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onClear && (
          <button
            onClick={onClear}
            className="text-[#007AFF] hover:text-[#0066CC] text-sm font-medium px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}