import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  FaReply, 
  FaForward, 
  FaStar, 
  FaTrash, 
  FaCopy, 
  FaInfo,
  FaRegStar,
  FaSmile
} from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { contacts } from '../../data/mockData';

const ContextMenuContainer = styled.div`
  position: absolute;
  background-color: var(--context-menu-background);
  border-radius: 3px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  padding: 6px 0;
  z-index: 1000;
  min-width: 180px;
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  transform: translate(-50%, -50%);
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  color: var(--context-menu-text);
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--context-menu-hover);
  }
  
  svg {
    margin-right: 10px;
    font-size: 16px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: var(--context-menu-border);
  margin: 4px 0;
`;

const ForwardMenu = styled.div`
  position: absolute;
  background-color: var(--context-menu-background);
  border-radius: 3px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  padding: 6px 0;
  z-index: 1000;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  left: ${props => props.position.x + 180}px;
  top: ${props => props.position.y}px;
`;

const ReactionsMenu = styled.div`
  position: absolute;
  background-color: var(--context-menu-background);
  border-radius: 30px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  padding: 8px;
  z-index: 1000;
  display: flex;
  align-items: center;
  left: ${props => props.position.x + 180}px;
  top: ${props => props.position.y}px;
`;

const ReactionOption = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const ContactItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  color: var(--context-menu-text);
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--context-menu-hover);
  }
  
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
  }
`;

const MessageContextMenu = ({ position, onClose, message, isSentByMe, onReply }) => {
  const menuRef = useRef(null);
  const forwardMenuRef = useRef(null);
  const [showForwardMenu, setShowForwardMenu] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const { toggleStarMessage, forwardMessage, deleteMessage, addReaction } = useChat();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      const isClickOutsideForwardMenu = !forwardMenuRef.current || !forwardMenuRef.current.contains(event.target);
      const isClickOutsideReactionsMenu = !event.target.closest('.reactions-menu');
      
      if (isClickOutsideMenu && isClickOutsideForwardMenu && isClickOutsideReactionsMenu) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
    onClose();
  };

  const handleForward = () => {
    setShowForwardMenu(true);
  };

  const handleForwardToContact = (contactId) => {
    forwardMessage(message, contactId);
    onClose();
  };

  const handleStar = () => {
    toggleStarMessage(message.chatId, message.id, !message.isStarred);
    onClose();
  };

  const handleDelete = () => {
    deleteMessage(message.chatId, message.id);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    onClose();
  };

  const handleInfo = () => {
    // Implement info functionality
    console.log('Message info:', message);
    onClose();
  };
  
  const handleReactClick = () => {
    setShowReactionsMenu(true);
  };
  
  const handleReactionSelect = (emoji) => {
    addReaction(message.chatId, message.id, {
      emoji,
      userId: 1, // Current user ID
      userName: 'You'
    });
    onClose();
  };

  return (
    <>
      <ContextMenuContainer ref={menuRef} position={position}>
        <MenuItem onClick={handleReply}>
          <FaReply />
          Reply
        </MenuItem>
        <MenuItem onClick={handleReactClick}>
          <FaSmile />
          React
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <FaForward />
          Forward
        </MenuItem>
        <MenuItem onClick={handleStar}>
          {message.isStarred ? <FaRegStar /> : <FaStar />}
          {message.isStarred ? 'Unstar' : 'Star'}
        </MenuItem>
        {isSentByMe && (
          <>
            <Divider />
            <MenuItem onClick={handleDelete}>
              <FaTrash />
              Delete
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleCopy}>
          <FaCopy />
          Copy
        </MenuItem>
        <MenuItem onClick={handleInfo}>
          <FaInfo />
          Info
        </MenuItem>
      </ContextMenuContainer>
      
      {showForwardMenu && (
        <ForwardMenu ref={forwardMenuRef} position={position}>
          {contacts.map(contact => (
            <ContactItem 
              key={contact.id} 
              onClick={() => handleForwardToContact(contact.id)}
            >
              <img src={contact.avatar} alt={contact.name} />
              {contact.name}
            </ContactItem>
          ))}
        </ForwardMenu>
      )}
      
      {showReactionsMenu && (
        <ReactionsMenu position={position} className="reactions-menu">
          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
            <ReactionOption 
              key={emoji} 
              onClick={() => handleReactionSelect(emoji)}
            >
              {emoji}
            </ReactionOption>
          ))}
        </ReactionsMenu>
      )}
    </>
  );
};

export default MessageContextMenu;
