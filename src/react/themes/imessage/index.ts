import { ThemeConfig } from '../types';
import { iMessageBubble } from './Bubble';
import { iMessageHeader } from './Header';
import { MessageInput } from './Input';
import { iMessageHistoryPanel } from './HistoryPanel';

export const imessageTheme: ThemeConfig = {
  name: 'imessage',
  displayName: 'Message Style',
  description: 'iOS Messages-inspired interface with rounded bubbles',
  components: {
    Bubble: iMessageBubble,
    Header: iMessageHeader,
    Input: MessageInput,
    HistoryPanel: iMessageHistoryPanel
  }
};