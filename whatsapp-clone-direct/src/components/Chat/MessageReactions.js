import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';
import { getContactById, currentUser } from '../../data/mockData';
import { FaInfoCircle } from 'react-icons/fa';

const ReactionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 4px 8px;
  background-color: ${props => props.isOutgoing 
    ? 'var(--outgoing-message-darker)' 
    : 'var(--incoming-message-darker)'};
  border-radius: 12px;
  align-self: flex-start;
  max-width: 100%;
  position: relative;
`;

const ReactionItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: ${props => props.isActive 
    ? 'var(--primary-color-light)' 
    : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isActive 
      ? 'var(--primary-color-light)' 
      : 'var(--hover-background)'};
  }
`;

const ReactionEmoji = styled.span`
  font-size: 16px;
  margin-right: 4px;
`;

const ReactionCount = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ReactorsTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--dropdown-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 8px;
  margin-bottom: 8px;
  z-index: 10;
  min-width: 150px;
  max-width: 250px;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: var(--dropdown-background) transparent transparent transparent;
  }
`;

const TooltipTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
    font-size: 12px;
    color: var(--icon-color);
  }
`;

const ReactorsList = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

const ReactorItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  color: var(--text-primary);
`;

const ReactorEmoji = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const ReactorName = styled.span`
  font-weight: ${props => props.isCurrentUser ? '500' : 'normal'};
`;

const MessageReactions = ({ message, isOutgoing }) => {
  const { addReaction, removeReaction } = useChat();
  const currentUserId = 1; // In a real app, this would come from auth context
  const [showReactors, setShowReactors] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  
  // Get all reactions for this message
  const reactions = message.reactions || {};
  
  // Calculate total reactions by emoji
  const reactionCounts = {};
  let totalReactions = 0;
  
  // Group reactors by emoji
  const reactorsByEmoji = {};
  
  Object.entries(reactions).forEach(([userId, emoji]) => {
    if (emoji) {
      // Count reactions
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
      totalReactions++;
      
      // Group reactors
      if (!reactorsByEmoji[emoji]) {
        reactorsByEmoji[emoji] = [];
      }
      
      const userIdNum = parseInt(userId, 10);
      const user = userIdNum === currentUser.id 
        ? { ...currentUser, isCurrentUser: true } 
        : getContactById(userIdNum);
        
      if (user) {
        reactorsByEmoji[emoji].push(user);
      }
    }
  });
  
  // Get current user's reaction
  const userReaction = reactions[currentUserId];
  
  const handleReactionClick = (emoji) => {
    if (userReaction === emoji) {
      // Remove reaction if clicking the same emoji
      removeReaction(message.chatId, message.id, currentUserId);
    } else {
      // Add or change reaction
      addReaction(message.chatId, message.id, currentUserId, emoji);
    }
  };
  
  const handleReactionHover = (emoji) => {
    setSelectedEmoji(emoji);
    setShowReactors(true);
  };
  
  const handleReactionLeave = () => {
    setShowReactors(false);
  };
  
  if (totalReactions === 0) {
    return null;
  }
  
  return (
    <ReactionsContainer isOutgoing={isOutgoing}>
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <ReactionItem 
          key={emoji} 
          isActive={userReaction === emoji}
          onClick={() => handleReactionClick(emoji)}
          onMouseEnter={() => handleReactionHover(emoji)}
          onMouseLeave={handleReactionLeave}
        >
          <ReactionEmoji>{emoji}</ReactionEmoji>
          <ReactionCount>{count}</ReactionCount>
        </ReactionItem>
      ))}
      
      {showReactors && selectedEmoji && reactorsByEmoji[selectedEmoji] && (
        <ReactorsTooltip>
          <TooltipTitle>
            <FaInfoCircle />
            {selectedEmoji} Reactions
          </TooltipTitle>
          <ReactorsList>
            {reactorsByEmoji[selectedEmoji].map(user => (
              <ReactorItem key={user.id}>
                <ReactorEmoji>{selectedEmoji}</ReactorEmoji>
                <ReactorName isCurrentUser={user.isCurrentUser}>
                  {user.isCurrentUser ? 'You' : user.name}
                </ReactorName>
              </ReactorItem>
            ))}
          </ReactorsList>
        </ReactorsTooltip>
      )}
    </ReactionsContainer>
  );
};

export default MessageReactions;
