import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

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
  align-items: center;
  
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
  font-size: 24px;
  padding: 6px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    transform: scale(1.2);
    background-color: var(--hover-background);
  }
  
  ${props => props.active && `
    background-color: var(--primary-color-light);
    transform: scale(1.1);
  `}
`;

const NavigationButton = styled.div`
  font-size: 14px;
  padding: 6px;
  cursor: pointer;
  color: var(--icon-color);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--primary-color);
  }
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      color: var(--icon-color);
    }
  `}
`;

const ReactionsPopup = ({ message, onClose }) => {
  const { addReaction, removeReaction } = useChat();
  const currentUserId = 1; // In a real app, this would come from auth context
  const [currentPage, setCurrentPage] = useState(0);
  
  // Get current user's reaction
  const userReaction = message.reactions ? message.reactions[currentUserId] : null;
  
  // Define reaction sets (pages)
  const reactionSets = [
    ['👍', '❤️', '😂', '😮', '😢', '🙏'],
    ['👏', '🔥', '🎉', '💯', '🤔', '😍'],
    ['😎', '🙄', '😡', '🤮', '🤯', '🥳']
  ];
  
  const currentReactions = reactionSets[currentPage];
  
  const handleReactionSelect = (emoji) => {
    if (userReaction === emoji) {
      // Remove reaction if clicking the same emoji
      removeReaction(message.chatId, message.id, currentUserId);
    } else {
      // Add or change reaction
      addReaction(message.chatId, message.id, currentUserId, emoji);
    }
    onClose();
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < reactionSets.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <PopupContainer>
      <NavigationButton 
        onClick={handlePrevPage} 
        disabled={currentPage === 0}
      >
        <FaChevronLeft />
      </NavigationButton>
      
      {currentReactions.map(emoji => (
        <ReactionButton 
          key={emoji}
          onClick={() => handleReactionSelect(emoji)}
          active={userReaction === emoji}
        >
          {emoji}
        </ReactionButton>
      ))}
      
      <NavigationButton 
        onClick={handleNextPage} 
        disabled={currentPage === reactionSets.length - 1}
      >
        <FaChevronRight />
      </NavigationButton>
    </PopupContainer>
  );
};

export default ReactionsPopup;
