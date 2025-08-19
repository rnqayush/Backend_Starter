import React from 'react';
import styled from 'styled-components';
import ChatListItem from './ChatListItem';
import StatusItem from './StatusItem';
import { useChat } from '../../contexts/ChatContext';

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: var(--sidebar-background);
`;

const EmptyList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 20px;
  text-align: center;
`;

const ChatList = ({ contacts, onContactSelect, selectedContactId, onArchivedClick, onStatusClick }) => {
  const { chats, archiveChat } = useChat();
  
  // If no contacts match the search criteria
  if (contacts.length === 0) {
    return (
      <ChatListContainer>
        <EmptyList>No chats found</EmptyList>
      </ChatListContainer>
    );
  }

  // Sort contacts by last message timestamp (most recent first)
  const sortedContacts = [...contacts].sort((a, b) => {
    const chatA = chats.find(chat => chat.contactId === a.id);
    const chatB = chats.find(chat => chat.contactId === b.id);
    
    if (!chatA && !chatB) return 0;
    if (!chatA) return 1;
    if (!chatB) return -1;
    
    return new Date(chatB.lastMessageTimestamp) - new Date(chatA.lastMessageTimestamp);
  });

  return (
    <ChatListContainer>
      <StatusItem onStatusClick={onStatusClick} />
      
      {sortedContacts.map(contact => {
        const chat = chats.find(c => c.contactId === contact.id);
        const lastMessage = chat?.messages[chat.messages.length - 1];
        
        return (
          <ChatListItem
            key={contact.id}
            contact={contact}
            lastMessage={lastMessage}
            unreadCount={chat?.unreadCount || 0}
            onClick={() => onContactSelect(contact)}
            isSelected={selectedContactId === contact.id}
          />
        );
      })}
    </ChatListContainer>
  );
};

export default ChatList;
