import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar/Sidebar';
import Chat from '../components/Chat/Chat';
import { ChatProvider } from '../contexts/ChatContext';
import { NotificationProvider } from '../contexts/NotificationContext';

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06), 0 2px 5px 0 rgba(0, 0, 0, 0.2);
`;

const WhatsApp = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ChatProvider>
      <NotificationProvider>
        <AppContainer>
          <Sidebar 
            setSelectedContact={setSelectedContact}
            selectedContact={selectedContact}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
          <Chat 
            selectedContact={selectedContact}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
        </AppContainer>
      </NotificationProvider>
    </ChatProvider>
  );
};

export default WhatsApp;

