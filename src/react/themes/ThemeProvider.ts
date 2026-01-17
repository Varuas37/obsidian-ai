/**
 * ThemeProvider - Factory Pattern Implementation
 * Centralizes theme management and component creation following SOLID principles
 */

import { ThemeConfig, ThemeName, ThemeRegistry } from './types';
import { defaultTheme } from './default/index';
import { imessageTheme } from './imessage/index';
import { minimalTheme } from './minimal/index';
import { discordTheme } from './discord/index';

/**
 * Theme Provider - Single Responsibility: Manage theme selection and component creation
 * Open/Closed: Open for extension (new themes), closed for modification
 * Liskov Substitution: All themes implement the same interface
 * Interface Segregation: Clean, focused interfaces
 * Dependency Inversion: Depends on abstractions, not implementations
 */
export class ThemeProvider {
  private static instance: ThemeProvider;
  private themes: ThemeRegistry;

  private constructor() {
    // Register all available themes
    this.themes = {
      default: defaultTheme,
      imessage: imessageTheme,
      minimal: minimalTheme,
      discord: discordTheme
    };
  }

  /**
   * Singleton pattern for theme management
   */
  public static getInstance(): ThemeProvider {
    if (!ThemeProvider.instance) {
      ThemeProvider.instance = new ThemeProvider();
    }
    return ThemeProvider.instance;
  }

  /**
   * Get theme configuration by name
   */
  public getTheme(themeName: ThemeName): ThemeConfig {
    const theme = this.themes[themeName];
    if (!theme) {
      console.warn(`Theme '${themeName}' not found, falling back to default`);
      return this.themes.default;
    }
    return theme;
  }

  /**
   * Get all available themes
   */
  public getAvailableThemes(): { name: ThemeName; displayName: string; description: string }[] {
    return Object.entries(this.themes).map(([name, config]) => ({
      name: name as ThemeName,
      displayName: config.displayName,
      description: config.description
    }));
  }

  /**
   * Register a new theme (Open/Closed Principle - open for extension)
   */
  public registerTheme(name: string, theme: ThemeConfig): void {
    this.themes[name] = theme;
  }

  /**
   * Check if theme exists
   */
  public hasTheme(themeName: string): boolean {
    return !!this.themes[themeName];
  }

  /**
   * Get theme components for direct use
   */
  public getComponents(themeName: ThemeName) {
    const theme = this.getTheme(themeName);
    return theme.components;
  }
}