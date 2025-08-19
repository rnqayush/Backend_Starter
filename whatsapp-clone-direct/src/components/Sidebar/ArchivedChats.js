import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaArchive } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { getContactById } from '../../data/mockData';

const ArchivedContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 30%;
  min-width: 300px;
  max-width: 450px;
  height: 100%;
  background-color: var(--sidebar-background);
  border-right: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex: 100%;
    max-width: 100%;
  }
`;

const ArchivedHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
`;

const BackButton = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
`;

const ArchivedList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ArchivedItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const ChatAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const ChatInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ChatTime = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 10px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 50px;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const EmptyStateTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 300px;
  line-height: 1.5;
`;

const ArchivedChats = ({ onClose, onSelectContact }) => {
  const { archivedChats, unarchiveChat } = useChat();
  
  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return { text: 'No messages yet', timestamp: new Date().toISOString() };
    }
    return chat.messages[chat.messages.length - 1];
  };
  
  const handleUnarchive = (chatId, event) => {
    event.stopPropagation();
    unarchiveChat(chatId);
  };
  
  const handleSelectChat = (chat) => {
    const contact = getContactById(chat.contactId);
    if (contact && onSelectContact) {
      onSelectContact(contact);
      onClose();
    }
  };
  
  return (
    <ArchivedContainer>
      <ArchivedHeader>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>Archived</HeaderTitle>
      </ArchivedHeader>
      
      <ArchivedList>
        {archivedChats.length > 0 ? (
          archivedChats.map(chat => {
            const contact = getContactById(chat.contactId);
            const lastMessage = getLastMessage(chat);
            
            return (
              <ArchivedItem 
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
              >
                <ChatAvatar src={contact.avatar} alt={contact.name} />
                <ChatInfo>
                  <ChatName>{contact.name}</ChatName>
                  <LastMessage>
                    {lastMessage.text}
                  </LastMessage>
                </ChatInfo>
                <ChatTime>{formatLastMessageTime(lastMessage.timestamp)}</ChatTime>
              </ArchivedItem>
            );
          })
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <FaArchive />
            </EmptyStateIcon>
            <EmptyStateTitle>No archived chats</EmptyStateTitle>
            <EmptyStateText>
              Archive chats to keep your chat list organized. Archived chats will appear here.
            </EmptyStateText>
          </EmptyState>
        )}
      </ArchivedList>
    </ArchivedContainer>
  );
};

export default ArchivedChats;

