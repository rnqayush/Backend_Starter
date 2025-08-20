import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaStar, FaEllipsisV } from 'react-icons/fa';
import { chats, contacts, formatMessageTime, currentUser } from '../../data/mockData';

const StarredContainer = styled.div`
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

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ChatSection = styled.div`
  margin-bottom: 24px;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
`;

const ChatAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const ChatName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const MessageItem = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin-bottom: 16px;
  margin-left: ${props => props.isOutgoing ? 'auto' : '0'};
  position: relative;
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isOutgoing ? 'var(--outgoing-message)' : 'var(--incoming-message)'};
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  position: relative;
  
  &:hover {
    .message-actions {
      display: flex;
    }
  }
`;

const MessageText = styled.div`
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 4px;
`;

const MessageActions = styled.div`
  position: absolute;
  top: -20px;
  right: ${props => props.isOutgoing ? '0' : 'auto'};
  left: ${props => props.isOutgoing ? 'auto' : '0'};
  display: none;
  background-color: var(--background-lighter);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const MessageAction = styled.div`
  padding: 4px 8px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  svg {
    font-size: 14px;
    color: var(--icon-color);
  }
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

const StarredMessages = ({ onClose, onJumpToChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // For demo purposes, let's assume some messages are starred
  // In a real app, this would be part of the message data
  const starredMessages = [];
  
  // Collect starred messages from all chats
  chats.forEach(chat => {
    const contact = contacts.find(c => c.id === chat.contactId);
    if (!contact) return;
    
    // For demo, let's star some random messages
    const chatStarredMessages = chat.messages
      .filter((_, index) => index % 5 === 0) // Star every 5th message for demo
      .map(msg => ({
        ...msg,
        chatId: chat.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
        isGroup: contact.isGroup
      }));
    
    starredMessages.push(...chatStarredMessages);
  });
  
  // Filter starred messages based on search query
  const filteredMessages = starredMessages.filter(msg => 
    msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group messages by chat
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const chatId = message.chatId;
    if (!groups[chatId]) {
      groups[chatId] = {
        chatId,
        contactName: message.contactName,
        contactAvatar: message.contactAvatar,
        isGroup: message.isGroup,
        messages: []
      };
    }
    groups[chatId].messages.push(message);
    return groups;
  }, {});
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleJumpToChat = (chatId, messageId) => {
    if (onJumpToChat) {
      onJumpToChat(chatId, messageId);
    }
    onClose();
  };
  
  const handleUnstar = (messageId) => {
    // In a real app, this would update the message in the database
    console.log(`Unstarred message ${messageId}`);
  };
  
  return (
    <StarredContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Starred messages</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaSearch />
          </ActionButton>
          <ActionButton>
            <FaEllipsisV />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <SearchContainer>
        <SearchInput>
          <FaSearch />
          <input 
            placeholder="Search starred messages"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchInput>
      </SearchContainer>
      
      {Object.keys(groupedMessages).length > 0 ? (
        <MessagesList>
          {Object.values(groupedMessages).map(group => (
            <ChatSection key={group.chatId}>
              <ChatHeader>
                <ChatAvatar src={group.contactAvatar} alt={group.contactName} />
                <ChatName>{group.contactName}</ChatName>
              </ChatHeader>
              
              {group.messages.map(message => (
                <MessageItem 
                  key={message.id}
                  isOutgoing={message.senderId === currentUser.id}
                >
                  <MessageBubble isOutgoing={message.senderId === currentUser.id}>
                    <MessageText>{message.text}</MessageText>
                    <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
                    
                    <MessageActions 
                      className="message-actions"
                      isOutgoing={message.senderId === currentUser.id}
                    >
                      <MessageAction onClick={() => handleUnstar(message.id)}>
                        <FaStar />
                      </MessageAction>
                    </MessageActions>
                  </MessageBubble>
                </MessageItem>
              ))}
            </ChatSection>
          ))}
        </MessagesList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaStar />
          </EmptyStateIcon>
          <EmptyStateTitle>No starred messages</EmptyStateTitle>
          <EmptyStateText>
            {searchQuery 
              ? `No starred messages found for "${searchQuery}"`
              : "Tap and hold on any message to star it, so you can easily find it later."}
          </EmptyStateText>
        </EmptyState>
      )}
    </StarredContainer>
  );
};

export default StarredMessages;

