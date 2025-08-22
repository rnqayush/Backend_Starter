import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaSmile } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { getContactById, currentUser, formatMessageTime } from '../../data/mockData';
import { formatMessageText, renderFormattedText } from '../../utils/messageFormatter';

const Container = styled.div`
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

const TabsContainer = styled.div`
  display: flex;
  background-color: var(--background);
  border-bottom: 1px solid var(--border-color);
`;

const Tab = styled.div`
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-bottom: ${props => props.active ? '2px solid var(--primary-color)' : 'none'};
  cursor: pointer;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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

const ReactionItem = styled.div`
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
`;

const ReactionEmoji = styled.div`
  font-size: 32px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
`;

const ReactionDetails = styled.div`
  flex: 1;
`;

const MessagePreview = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReactionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
`;

const ReactorName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const ReactionTime = styled.span``;

const AllReactionsView = ({ contact, onClose, onJumpToMessage }) => {
  const { chats } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allReactions, setAllReactions] = useState([]);
  
  useEffect(() => {
    // Find the chat for this contact
    const chat = chats.find(c => c.contactId === contact.id);
    if (!chat) return;
    
    // Collect all reactions from messages
    const reactions = [];
    
    chat.messages.forEach(message => {
      if (message.reactions) {
        Object.entries(message.reactions).forEach(([userId, emoji]) => {
          const userIdNum = parseInt(userId, 10);
          const user = userIdNum === currentUser.id 
            ? { ...currentUser, isCurrentUser: true } 
            : getContactById(userIdNum);
            
          if (user) {
            reactions.push({
              messageId: message.id,
              message: message,
              emoji: emoji,
              user: user,
              timestamp: message.timestamp
            });
          }
        });
      }
    });
    
    // Sort by timestamp (newest first)
    reactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setAllReactions(reactions);
  }, [chats, contact.id]);
  
  // Filter reactions based on search query and active tab
  const filteredReactions = allReactions.filter(reaction => {
    // Filter by search query
    const messageText = reaction.message.text || '';
    const userName = reaction.user.name || '';
    const searchMatch = messageText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       reaction.emoji.includes(searchQuery);
    
    // Filter by tab
    if (activeTab === 'all') {
      return searchMatch;
    } else if (activeTab === 'you') {
      return searchMatch && reaction.user.isCurrentUser;
    } else if (activeTab === 'others') {
      return searchMatch && !reaction.user.isCurrentUser;
    }
    
    return searchMatch;
  });
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleJumpToMessage = (messageId) => {
    if (onJumpToMessage) {
      onJumpToMessage(messageId);
    }
    onClose();
  };
  
  return (
    <Container>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Message reactions</h1>
        </HeaderTitle>
      </Header>
      
      <SearchContainer>
        <SearchInput>
          <FaSearch />
          <input 
            placeholder="Search reactions"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchInput>
      </SearchContainer>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All
        </Tab>
        <Tab 
          active={activeTab === 'you'} 
          onClick={() => setActiveTab('you')}
        >
          You
        </Tab>
        <Tab 
          active={activeTab === 'others'} 
          onClick={() => setActiveTab('others')}
        >
          Others
        </Tab>
      </TabsContainer>
      
      <Content>
        {filteredReactions.length > 0 ? (
          filteredReactions.map((reaction, index) => (
            <ReactionItem 
              key={`${reaction.messageId}-${reaction.user.id}-${index}`}
              onClick={() => handleJumpToMessage(reaction.messageId)}
            >
              <ReactionEmoji>{reaction.emoji}</ReactionEmoji>
              <ReactionDetails>
                <MessagePreview>
                  {reaction.message.text && renderFormattedText(formatMessageText(reaction.message.text))}
                  {!reaction.message.text && reaction.message.type && `[${reaction.message.type}]`}
                </MessagePreview>
                <ReactionMeta>
                  <ReactorName>
                    {reaction.user.isCurrentUser ? 'You' : reaction.user.name}
                  </ReactorName>
                  <ReactionTime>
                    {formatMessageTime(reaction.timestamp)}
                  </ReactionTime>
                </ReactionMeta>
              </ReactionDetails>
            </ReactionItem>
          ))
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <FaSmile />
            </EmptyStateIcon>
            <EmptyStateTitle>No reactions found</EmptyStateTitle>
            <EmptyStateText>
              {searchQuery 
                ? `No reactions found for "${searchQuery}"`
                : "No one has reacted to messages in this chat yet."}
            </EmptyStateText>
          </EmptyState>
        )}
      </Content>
    </Container>
  );
};

export default AllReactionsView;
