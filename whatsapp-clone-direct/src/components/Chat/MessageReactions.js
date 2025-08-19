import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../../contexts/ChatContext';
import { currentUser } from '../../data/mockData';

const ReactionsContainer = styled.div`
  position: absolute;
  bottom: -25px;
  ${props => props.isSentByMe ? 'right: 10px;' : 'left: 10px;'}
  background-color: var(--context-menu-background);
  border-radius: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  padding: 5px;
  z-index: 10;
`;

const ReactionButton = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const ReactionsDisplay = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--context-menu-background);
  border-radius: 12px;
  padding: 2px 4px;
  margin-top: 4px;
  align-self: ${props => props.isSentByMe ? 'flex-end' : 'flex-start'};
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
`;

const ReactionEmoji = styled.div`
  font-size: 14px;
  margin: 0 2px;
  position: relative;
  cursor: pointer;
  
  &::after {
    content: '${props => props.count > 1 ? props.count : ''}';
    position: absolute;
    top: -5px;
    right: -5px;
    font-size: 10px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 50%;
    width: ${props => props.count > 1 ? '14px' : '0'};
    height: ${props => props.count > 1 ? '14px' : '0'};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ReactionsPopup = ({ message, isSentByMe, onClose }) => {
  const popupRef = useRef(null);
  const { addReaction } = useChat();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  const handleReactionClick = (emoji) => {
    addReaction(message.chatId, message.id, {
      emoji,
      userId: currentUser.id
    });
    onClose();
  };
  
  return (
    <ReactionsContainer ref={popupRef} isSentByMe={isSentByMe}>
      {reactions.map(emoji => (
        <ReactionButton 
          key={emoji} 
          onClick={() => handleReactionClick(emoji)}
        >
          {emoji}
        </ReactionButton>
      ))}
    </ReactionsContainer>
  );
};

const MessageReactions = ({ message, isSentByMe }) => {
  const { removeReaction } = useChat();
  
  if (!message.reactions || message.reactions.length === 0) {
    return null;
  }
  
  // Group reactions by emoji
  const groupedReactions = message.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {});
  
  const handleReactionClick = (emoji) => {
    // Find if current user has this reaction
    const userReaction = message.reactions.find(
      r => r.emoji === emoji && r.userId === currentUser.id
    );
    
    if (userReaction) {
      removeReaction(message.chatId, message.id, userReaction.id);
    }
  };
  
  return (
    <ReactionsDisplay isSentByMe={isSentByMe}>
      {Object.entries(groupedReactions).map(([emoji, reactions]) => (
        <ReactionEmoji 
          key={emoji} 
          count={reactions.length}
          onClick={() => handleReactionClick(emoji)}
          title={reactions.map(r => r.userName || 'User').join(', ')}
        >
          {emoji}
        </ReactionEmoji>
      ))}
    </ReactionsDisplay>
  );
};

export { ReactionsPopup, MessageReactions };

