# WhatsApp Clone

A responsive WhatsApp Web clone built with React and styled-components.

## Features

- **Responsive UI**: Works on both desktop and mobile devices
- **Sidebar Components**:
  - User profile header with status
  - Search functionality for chats
  - Chat list with contact information and last message preview
- **Chat Components**:
  - Chat header with contact information
  - Message list with date dividers
  - Message bubbles with timestamps and status indicators
  - Chat input with emoji and attachment icons
  - Empty chat state for initial view
- **Modal Components**:
  - Profile modal for viewing user information
- **Mock Data**:
  - User profile data
  - Contacts list with online status
  - Chat history with message status

## Technologies Used

- React
- Styled Components
- React Icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/whatsapp-clone.git
```

2. Navigate to the project directory
```
cd whatsapp-clone
```

3. Install dependencies
```
npm install
```
or
```
yarn install
```

4. Start the development server
```
npm start
```
or
```
yarn start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```
src/
├── components/
│   ├── Chat/
│   │   ├── Chat.js
│   │   ├── ChatHeader.js
│   │   ├── ChatInput.js
│   │   ├── EmptyChat.js
│   │   ├── Message.js
│   │   └── MessageList.js
│   ├── Modals/
│   │   └── ProfileModal.js
│   └── Sidebar/
│       ├── ChatList.js
│       ├── ChatListItem.js
│       ├── SearchBar.js
│       ├── Sidebar.js
│       └── SidebarHeader.js
├── data/
│   └── mockData.js
├── pages/
│   └── WhatsApp.js
├── styles/
│   └── GlobalStyles.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Future Enhancements

- Add authentication
- Implement real-time messaging with WebSockets
- Add file sharing functionality
- Implement voice and video calling features
- Add dark mode
- Connect to a backend API for persistent data

## License

This project is licensed under the MIT License.

## Acknowledgments

- WhatsApp Web for design inspiration
- React Icons for the icon set
- Styled Components for the styling solution

