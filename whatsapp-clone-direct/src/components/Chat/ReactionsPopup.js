import React from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';

const PopupContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--dropdown-background);
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  padding: 8px;
  margin-bottom: 8px;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px;
    border-style: solid;
    border-color: var(--dropdown-background) transparent transparent transparent;
  }
`;

const ReactionButton = styled.div`
  font-size: 22px;
  padding: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const ReactionsPopup = ({ message, onClose }) => {
  const { addReaction } = useChat();
  const currentUserId = 1; // In a real app, this would come from auth context
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  const handleReactionSelect = (emoji) => {
    addReaction(message.chatId, message.id, currentUserId, emoji);
    onClose();
  };
  
  return (
    <PopupContainer>
      {reactions.map(emoji => (
        <ReactionButton 
          key={emoji}
          onClick={() => handleReactionSelect(emoji)}
        >
          {emoji}
        </ReactionButton>
      ))}
    </PopupContainer>
  );
};

export default ReactionsPopup;

