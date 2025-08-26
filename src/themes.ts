export interface ThemeColors {
  '--bg-color': string;
  '--chat-bg-color': string;
  '--header-bg-color': string;
  '--header-text-color': string;
  '--message-user-bg': string;
  '--message-user-text': string;
  '--message-ai-bg': string;
  '--message-ai-text': string;
  '--input-bg-color': string;
  '--input-border-color': string;
  '--welcome-text-color': string;
  '--border-color': string;
  '--typing-indicator-color': string;
  '--thoughts-border-color': string;
  '--thoughts-bg-color': string;
  '--thoughts-content-bg': string;
  '--thoughts-summary-color': string;
  '--scrollbar-thumb-color': string;
  '--scrollbar-track-color': string;
  '--button-bg-color': string;
  '--button-text-color': string;
  '--button-disabled-bg-color': string;
  '--button-disabled-text-color': string;
}

export const themes: Record<string, ThemeColors> = {
  light: {
    '--bg-color': '#f5f5f5',
    '--chat-bg-color': 'white',
    '--header-bg-color': '#4a6fa5',
    '--header-text-color': 'white',
    '--message-user-bg': '#4a6fa5',
    '--message-user-text': 'white',
    '--message-ai-bg': '#f0f0f0',
    '--message-ai-text': '#333',
    '--input-bg-color': 'white',
    '--input-border-color': '#ddd',
    '--welcome-text-color': '#666',
    '--border-color': '#eee',
    '--typing-indicator-color': '#999',
    '--thoughts-border-color': '#4a6fa5',
    '--thoughts-bg-color': 'rgba(74, 111, 165, 0.05)',
    '--thoughts-content-bg': 'rgba(0, 0, 0, 0.03)',
    '--thoughts-summary-color': '#4a6fa5',
    '--scrollbar-thumb-color': '#888',
    '--scrollbar-track-color': '#f1f1f1',
    '--button-bg-color': '#4a6fa5',
    '--button-text-color': 'white',
    '--button-disabled-bg-color': '#ccc',
    '--button-disabled-text-color': '#666',
  },
  dark: {
    '--bg-color': '#1a1a1a',
    '--chat-bg-color': '#2d2d2d',
    '--header-bg-color': '#3a4a5a',
    '--header-text-color': '#f0f0f0',
    '--message-user-bg': '#3a4a5a',
    '--message-user-text': 'white',
    '--message-ai-bg': '#3a3a3a',
    '--message-ai-text': '#f0f0f0',
    '--input-bg-color': '#3a3a3a',
    '--input-border-color': '#555',
    '--welcome-text-color': '#aaa',
    '--border-color': '#444',
    '--typing-indicator-color': '#aaa',
    '--thoughts-border-color': '#6a8aa5',
    '--thoughts-bg-color': 'rgba(74, 111, 165, 0.1)',
    '--thoughts-content-bg': 'rgba(255, 255, 255, 0.05)',
    '--thoughts-summary-color': '#6a8aa5',
    '--scrollbar-thumb-color': '#555',
    '--scrollbar-track-color': '#333',
    '--button-bg-color': '#3a4a5a',
    '--button-text-color': '#f0f0f0',
    '--button-disabled-bg-color': '#555',
    '--button-disabled-text-color': '#999',
  },
  darcula: {
    '--bg-color': '#2B2B2B',
    '--chat-bg-color': '#3C3F41',
    '--header-bg-color': '#3C3F41',
    '--header-text-color': '#BBBBBB',
    '--message-user-bg': '#4E6A80',
    '--message-user-text': '#FFFFFF',
    '--message-ai-bg': '#4E4E4E',
    '--message-ai-text': '#BBBBBB',
    '--input-bg-color': '#3C3F41',
    '--input-border-color': '#616161',
    '--welcome-text-color': '#999999',
    '--border-color': '#555555',
    '--typing-indicator-color': '#AAAAAA',
    '--thoughts-border-color': '#6A8090',
    '--thoughts-bg-color': 'rgba(78, 106, 128, 0.1)',
    '--thoughts-content-bg': 'rgba(0, 0, 0, 0.1)',
    '--thoughts-summary-color': '#6A8090',
    '--scrollbar-thumb-color': '#616161',
    '--scrollbar-track-color': '#4E4E4E',
    '--button-bg-color': '#4E6A80',
    '--button-text-color': '#FFFFFF',
    '--button-disabled-bg-color': '#616161',
    '--button-disabled-text-color': '#999999',
  },
  'tokyo-night': {
    '--bg-color': '#1A1B26',
    '--chat-bg-color': '#24283B',
    '--header-bg-color': '#24283B',
    '--header-text-color': '#C0CAF5',
    '--message-user-bg': '#7AA2F7',
    '--message-user-text': '#FFFFFF',
    '--message-ai-bg': '#414868',
    '--message-ai-text': '#A9B1D6',
    '--input-bg-color': '#24283B',
    '--input-border-color': '#565F89',
    '--welcome-text-color': '#787C99',
    '--border-color': '#3B4261',
    '--typing-indicator-color': '#A9B1D6',
    '--thoughts-border-color': '#7AA2F7',
    '--thoughts-bg-color': 'rgba(122, 162, 247, 0.1)',
    '--thoughts-content-bg': 'rgba(0, 0, 0, 0.1)',
    '--thoughts-summary-color': '#7AA2F7',
    '--scrollbar-thumb-color': '#565F89',
    '--scrollbar-track-color': '#3B4261',
    '--button-bg-color': '#7AA2F7',
    '--button-text-color': '#FFFFFF',
    '--button-disabled-bg-color': '#565F89',
    '--button-disabled-text-color': '#787C99',
  },
  'solarized-dark': {
    '--bg-color': '#002B36',
    '--chat-bg-color': '#073642',
    '--header-bg-color': '#073642',
    '--header-text-color': '#839496',
    '--message-user-bg': '#268BD2',
    '--message-user-text': '#FDF6E3',
    '--message-ai-bg': '#586E75',
    '--message-ai-text': '#93A1A1',
    '--input-bg-color': '#073642',
    '--input-border-color': '#586E75',
    '--welcome-text-color': '#657B83',
    '--border-color': '#004B56',
    '--typing-indicator-color': '#93A1A1',
    '--thoughts-border-color': '#268BD2',
    '--thoughts-bg-color': 'rgba(38, 139, 210, 0.1)',
    '--thoughts-content-bg': 'rgba(0, 0, 0, 0.1)',
    '--thoughts-summary-color': '#268BD2',
    '--scrollbar-thumb-color': '#586E75',
    '--scrollbar-track-color': '#004B56',
    '--button-bg-color': '#268BD2',
    '--button-text-color': '#FDF6E3',
    '--button-disabled-bg-color': '#586E75',
    '--button-disabled-text-color': '#657B83',
  },
  catppuccin: { // Mocha variant
    '--bg-color': '#1E1E2E',
    '--chat-bg-color': '#181825',
    '--header-bg-color': '#181825',
    '--header-text-color': '#CDD6F4',
    '--message-user-bg': '#89B4FA', // Blue
    '--message-user-text': '#1E1E2E',
    '--message-ai-bg': '#45475A', // Surface1
    '--message-ai-text': '#CDD6F4', // Text
    '--input-bg-color': '#181825',
    '--input-border-color': '#585B70', // Surface0
    '--welcome-text-color': '#A6ADC8', // Subtext0
    '--border-color': '#313244', // Surface0
    '--typing-indicator-color': '#A6ADC8',
    '--thoughts-border-color': '#89B4FA',
    '--thoughts-bg-color': 'rgba(137, 180, 250, 0.1)',
    '--thoughts-content-bg': 'rgba(0, 0, 0, 0.1)',
    '--thoughts-summary-color': '#89B4FA',
    '--scrollbar-thumb-color': '#585B70',
    '--scrollbar-track-color': '#313244',
    '--button-bg-color': '#89B4FA',
    '--button-text-color': '#1E1E2E',
    '--button-disabled-bg-color': '#585B70',
    '--button-disabled-text-color': '#A6ADC8',
  },
};
