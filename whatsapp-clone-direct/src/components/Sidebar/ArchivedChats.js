import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaArchive } from 'react-icons/fa';
import { chats, contacts, formatChatListDate } from '../../data/mockData';
import ChatListItem from './ChatListItem';

const ArchivedContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  height: 60px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    font-size: 19px;
    font-weight: 500;
    margin-left: 24px;
  }
`;

const BackButton = styled.div`
  cursor: pointer;
  font-size: 18px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.div`
  margin-left: 24px;
  cursor: pointer;
`;

const SearchContainer = styled.div`
  padding: 8px 12px;
  background-color: var(--background);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--search-input-background);
  border-radius: 8px;
  padding: 8px 12px;
  
  svg {
    color: var(--text-secondary);
    margin-right: 12px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    background-color: transparent;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
`;

const ChatsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
  font-size: 80px;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  max-width: 300px;
  line-height: 1.5;
`;

const ArchivedChats = ({ onClose, onChatSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // For demo purposes, let's assume some chats are archived
  // In a real app, this would be part of the chat data
  const archivedChatIds = [2, 4]; // IDs of archived chats
  
  const archivedChats = chats.filter(chat => archivedChatIds.includes(chat.id));
  
  const filteredChats = archivedChats.filter(chat => {
    const contact = contacts.find(c => c.id === chat.contactId);
    if (!contact) return false;
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const matchesName = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMessage = lastMessage && lastMessage.text && 
      lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesName || matchesMessage;
  });
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleChatClick = (chatId) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
    onClose();
  };
  
  return (
    <ArchivedContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Archived</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaSearch />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <SearchContainer>
        <SearchInput>
          <FaSearch />
          <input 
            placeholder="Search archived chats"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchInput>
      </SearchContainer>
      
      {filteredChats.length > 0 ? (
        <ChatsList>
          {filteredChats.map(chat => {
            const contact = contacts.find(c => c.id === chat.contactId);
            const lastMessage = chat.messages[chat.messages.length - 1];
            
            return (
              <ChatListItem 
                key={chat.id}
                avatar={contact.avatar}
                name={contact.name}
                message={lastMessage.text}
                time={formatChatListDate(lastMessage.timestamp)}
                unreadCount={chat.unreadCount}
                isGroup={contact.isGroup}
                onClick={() => handleChatClick(chat.id)}
              />
            );
          })}
        </ChatsList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaArchive />
          </EmptyStateIcon>
          <EmptyStateTitle>No archived chats</EmptyStateTitle>
          <EmptyStateText>
            {searchQuery 
              ? `No archived chats found for "${searchQuery}"`
              : "When you archive a chat, it will appear here."}
          </EmptyStateText>
        </EmptyState>
      )}
    </ArchivedContainer>
  );
};

export default ArchivedChats;

