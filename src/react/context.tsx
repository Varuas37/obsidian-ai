import React, { createContext, useContext } from 'react';
import { App } from 'obsidian';
import { AIService } from '../core/ai-service';
import { SettingsManager } from '../settings/settings-manager';

// App Context for accessing Obsidian App throughout React components
export const AppContext = createContext<App | undefined>(undefined);

// AI Service Context for accessing AI functionality
export const AIServiceContext = createContext<AIService | undefined>(undefined);

// Settings Context for accessing plugin settings
export const SettingsContext = createContext<SettingsManager | undefined>(undefined);

// Custom hooks for easier access
export const useApp = (): App => {
  const app = useContext(AppContext);
  if (!app) {
    throw new Error('useApp must be used within an AppContext.Provider');
  }
  return app;
};

export const useAIService = (): AIService => {
  const aiService = useContext(AIServiceContext);
  if (!aiService) {
    throw new Error('useAIService must be used within an AIServiceContext.Provider');
  }
  return aiService;
};

export const useSettings = (): SettingsManager => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error('useSettings must be used within a SettingsContext.Provider');
  }
  return settings;
};

// Combined provider for convenience
interface ContextProvidersProps {
  app: App;
  aiService: AIService;
  settingsManager: SettingsManager;
  children: React.ReactNode;
}

export const ContextProviders: React.FC<ContextProvidersProps> = ({
  app,
  aiService,
  settingsManager,
  children
}) => {
  return (
    <AppContext.Provider value={app}>
      <AIServiceContext.Provider value={aiService}>
        <SettingsContext.Provider value={settingsManager}>
          {children}
        </SettingsContext.Provider>
      </AIServiceContext.Provider>
    </AppContext.Provider>
  );
};