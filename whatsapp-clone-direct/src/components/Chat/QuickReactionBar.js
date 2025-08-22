import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';

const QuickReactionContainer = styled.div`
  position: absolute;
  top: -40px;
  right: ${props => props.isSentByMe ? '0' : 'auto'};
  left: ${props => props.isSentByMe ? 'auto' : '0'};
  background-color: var(--dropdown-background);
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 5px;
  z-index: 10;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  
  ${props => props.show && `
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  `}
`;

const ReactionButton = styled.div`
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.2s, background-color 0.2s;
  
  &:hover {
    transform: scale(1.2);
    background-color: var(--hover-background);
  }
`;

const QuickReactionBar = ({ message, isSentByMe, show }) => {
  const { addReaction } = useChat();
  const currentUserId = 1; // In a real app, this would come from auth context
  
  // Common quick reactions
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  const handleReactionClick = (emoji) => {
    addReaction(message.chatId, message.id, currentUserId, emoji);
  };
  
  return (
    <QuickReactionContainer isSentByMe={isSentByMe} show={show}>
      {quickReactions.map(emoji => (
        <ReactionButton 
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
        >
          {emoji}
        </ReactionButton>
      ))}
    </QuickReactionContainer>
  );
};

export default QuickReactionBar;
