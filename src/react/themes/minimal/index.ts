import { ThemeConfig } from '../types';
import { MinimalBubble } from './Bubble';
import { MinimalHeader } from './Header';
import { MinimalInput } from './Input';
import { MinimalHistoryPanel } from './HistoryPanel';

export const minimalTheme: ThemeConfig = {
  name: 'minimal',
  displayName: 'Minimal',
  description: 'Clean, minimal design with subtle indicators',
  components: {
    Bubble: MinimalBubble,
    Header: MinimalHeader,
    Input: MinimalInput,
    HistoryPanel: MinimalHistoryPanel
  }
};