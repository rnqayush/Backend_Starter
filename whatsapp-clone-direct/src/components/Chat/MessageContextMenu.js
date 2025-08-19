import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  FaReply, 
  FaForward, 
  FaStar, 
  FaTrash, 
  FaCopy, 
  FaInfo,
  FaRegStar
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
  const { toggleStarMessage, forwardMessage, deleteMessage } = useChat();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          (!forwardMenuRef.current || !forwardMenuRef.current.contains(event.target))) {
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

  return (
    <>
      <ContextMenuContainer ref={menuRef} position={position}>
        <MenuItem onClick={handleReply}>
          <FaReply />
          Reply
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
    </>
  );
};

export default MessageContextMenu;
