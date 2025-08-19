import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* WhatsApp color palette */
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
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, 'Lucida Grande', Arial, sans-serif;
  }

  body {
    background-color: #dadbd3;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
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

  ::-webkit-scrollbar-thumb:hover {
    background: #a6a6a6;
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
`;

export default GlobalStyles;

