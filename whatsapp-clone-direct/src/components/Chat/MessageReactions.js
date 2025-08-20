import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';

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

const MessageReactions = ({ message, isOutgoing }) => {
  const { addReaction, removeReaction } = useChat();
  const currentUserId = 1; // In a real app, this would come from auth context
  
  // Get all reactions for this message
  const reactions = message.reactions || {};
  
  // Calculate total reactions by emoji
  const reactionCounts = {};
  let totalReactions = 0;
  
  Object.entries(reactions).forEach(([userId, emoji]) => {
    if (emoji) {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
      totalReactions++;
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
        >
          <ReactionEmoji>{emoji}</ReactionEmoji>
          <ReactionCount>{count}</ReactionCount>
        </ReactionItem>
      ))}
    </ReactionsContainer>
  );
};

export default MessageReactions;

