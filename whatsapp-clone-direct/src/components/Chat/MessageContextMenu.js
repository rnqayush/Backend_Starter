import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  FaReply, 
  FaForward, 
  FaStar, 
  FaTrash, 
  FaCopy, 
  FaInfo 
} from 'react-icons/fa';

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

const MessageContextMenu = ({ position, onClose, message, isSentByMe }) => {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleReply = () => {
    // Implement reply functionality
    console.log('Reply to message:', message);
    onClose();
  };

  const handleForward = () => {
    // Implement forward functionality
    console.log('Forward message:', message);
    onClose();
  };

  const handleStar = () => {
    // Implement star functionality
    console.log('Star message:', message);
    onClose();
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Delete message:', message);
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
        <FaStar />
        Star
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
  );
};

export default MessageContextMenu;

