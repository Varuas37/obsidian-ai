import { ThemeConfig } from '../types';
import { MinimalBubble } from './Bubble';
import { MinimalHeader } from './Header';
import { MinimalInput } from './Input';

export const minimalTheme: ThemeConfig = {
  name: 'minimal',
  displayName: 'Minimal',
  description: 'Clean, minimal design with subtle indicators',
  components: {
    Bubble: MinimalBubble,
    Header: MinimalHeader,
    Input: MinimalInput
  }
};