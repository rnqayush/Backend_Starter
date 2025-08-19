import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Light theme colors */
    --primary-color: #00a884;
    --secondary-color: #008069;
    --light-green: #dcf8c6;
    --chat-background: #efeae2;
    --incoming-message: #ffffff;
    --outgoing-message: #d9fdd3;
    --sidebar-background: #ffffff;
    --sidebar-header: #f0f2f5;
    --search-background: #f0f2f5;
    --border-color: #e9edef;
    --icon-color: #54656f;
    --text-primary: #111b21;
    --text-secondary: #667781;
    --notification-color: #25d366;
    --unread-badge: #25d366;
    --chat-hover: #f5f6f6;
    --dropdown-background: #ffffff;
    --dropdown-hover: #f0f2f5;
    --modal-background: rgba(17, 27, 33, 0.5);
    --app-background: #dadbd3;
    --message-status: #8696a0;
    --typing-indicator: #00a884;
    --emoji-picker-background: #ffffff;
    --emoji-picker-border: #e9edef;
    --context-menu-background: #ffffff;
    --context-menu-hover: #f0f2f5;
    --context-menu-text: #111b21;
    --context-menu-border: #e9edef;
    --settings-background: #ffffff;
    --settings-hover: #f0f2f5;
    --settings-border: #e9edef;
    --audio-player-background: #ffffff;
    --audio-player-progress: #00a884;
    --audio-player-thumb: #00a884;
    --audio-player-track: #e9edef;
    --search-highlight: #ffff00;
  }

  /* Dark theme colors */
  body.dark-mode {
    --primary-color: #00a884;
    --secondary-color: #008069;
    --light-green: #025144;
    --chat-background: #0b141a;
    --incoming-message: #202c33;
    --outgoing-message: #005c4b;
    --sidebar-background: #111b21;
    --sidebar-header: #202c33;
    --search-background: #202c33;
    --border-color: #222d34;
    --icon-color: #aebac1;
    --text-primary: #e9edef;
    --text-secondary: #8696a0;
    --notification-color: #00a884;
    --unread-badge: #00a884;
    --chat-hover: #202c33;
    --dropdown-background: #233138;
    --dropdown-hover: #182229;
    --modal-background: rgba(0, 0, 0, 0.8);
    --app-background: #0c1317;
    --message-status: #8696a0;
    --typing-indicator: #00a884;
    --emoji-picker-background: #202c33;
    --emoji-picker-border: #222d34;
    --context-menu-background: #233138;
    --context-menu-hover: #182229;
    --context-menu-text: #e9edef;
    --context-menu-border: #222d34;
    --settings-background: #111b21;
    --settings-hover: #202c33;
    --settings-border: #222d34;
    --audio-player-background: #202c33;
    --audio-player-progress: #00a884;
    --audio-player-thumb: #00a884;
    --audio-player-track: #2a3942;
    --search-highlight: #ffff00;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif;
  }

  body {
    background-color: var(--app-background);
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
    transition: background-color 0.3s ease;
  }

  #root {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 10px;
  }

  body.dark-mode ::-webkit-scrollbar-thumb {
    background: #374045;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a6a6a6;
  }

  body.dark-mode ::-webkit-scrollbar-thumb:hover {
    background: #4a5459;
  }

  /* Utility classes */
  .flex {
    display: flex;
  }

  .flex-column {
    flex-direction: column;
  }

  .align-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .hidden {
    display: none;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Transition for theme switching */
  .theme-transition {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  /* Context menu styling */
  .context-menu {
    position: absolute;
    background-color: var(--context-menu-background);
    border-radius: 3px;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
    padding: 6px 0;
    z-index: 1000;
    min-width: 150px;
  }

  .context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    color: var(--context-menu-text);
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .context-menu-item:hover {
    background-color: var(--context-menu-hover);
  }

  .context-menu-item svg {
    margin-right: 10px;
    font-size: 16px;
  }

  /* Emoji picker styling */
  .emoji-picker-container {
    position: absolute;
    bottom: 70px;
    left: 10px;
    z-index: 100;
  }

  /* Audio player styling */
  .audio-player {
    display: flex;
    align-items: center;
    background-color: var(--audio-player-background);
    border-radius: 8px;
    padding: 8px 12px;
    width: 100%;
    max-width: 300px;
  }

  .audio-player-controls {
    margin-right: 10px;
    cursor: pointer;
    color: var(--icon-color);
  }

  .audio-player-progress {
    flex: 1;
    height: 4px;
    background-color: var(--audio-player-track);
    border-radius: 2px;
    position: relative;
    cursor: pointer;
  }

  .audio-player-progress-bar {
    height: 100%;
    background-color: var(--audio-player-progress);
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
  }

  .audio-player-time {
    margin-left: 10px;
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 40px;
    text-align: right;
  }

  /* Search highlight */
  .search-highlight {
    background-color: var(--search-highlight);
    color: var(--text-primary);
  }

  /* Typing indicator */
  .typing-indicator {
    display: flex;
    align-items: center;
    color: var(--typing-indicator);
    font-size: 14px;
  }

  .typing-indicator-dots {
    display: flex;
    margin-left: 5px;
  }

  .typing-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--typing-indicator);
    margin: 0 1px;
    animation: typing-animation 1.4s infinite ease-in-out;
  }

  .typing-indicator-dot:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-indicator-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-animation {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-5px);
    }
  }
`;

export default GlobalStyles;

