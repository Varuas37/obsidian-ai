import { ThemeConfig } from '../types';
import { DiscordBubble } from './Bubble';
import { DiscordHeader } from './Header';
import { DiscordInput } from './Input';
import { DiscordHistoryPanel } from './HistoryPanel';

export const discordTheme: ThemeConfig = {
  name: 'discord',
  displayName: 'Discord Style',
  description: 'Chat application-style with avatars and modern layout',
  components: {
    Bubble: DiscordBubble,
    Header: DiscordHeader,
    Input: DiscordInput,
    HistoryPanel: DiscordHistoryPanel
  }
};