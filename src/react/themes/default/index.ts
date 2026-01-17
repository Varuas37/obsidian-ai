import { ThemeConfig } from '../types';
import { DefaultBubble } from './Bubble';
import { DefaultHeader } from './Header';
import { DefaultInput } from './Input';
import { DefaultHistoryPanel } from './HistoryPanel';

export const defaultTheme: ThemeConfig = {
  name: 'default',
  displayName: 'Default (Obsidian)',
  description: 'Original Obsidian-native styling with professional design',
  components: {
    Bubble: DefaultBubble,
    Header: DefaultHeader,
    Input: DefaultInput,
    HistoryPanel: DefaultHistoryPanel
  }
};