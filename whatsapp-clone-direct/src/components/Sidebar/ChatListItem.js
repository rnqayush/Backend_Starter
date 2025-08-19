import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaCheckDouble, FaArchive, FaVolumeOff, FaTrash } from 'react-icons/fa';
import { formatChatListDate } from '../../utils/formatters';
import { useChat } from '../../contexts/ChatContext';

const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  background-color: ${props => props.isSelected ? 'var(--chat-hover)' : 'transparent'};
  position: relative;
  
  &:hover {
    background-color: var(--chat-hover);
  }
`;

const Avatar = styled.img`
  width: 49px;
  height: 49px;
  border-radius: 50%;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
`;

const ContactName = styled.span`
  font-weight: ${props => props.unread ? '600' : '400'};
  font-size: 17px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: ${props => props.unread ? 'var(--unread-badge)' : 'var(--text-secondary)'};
  white-space: nowrap;
  margin-left: 6px;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LastMessage = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
  font-weight: ${props => props.unread ? '500' : '400'};
`;

const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.read ? 'var(--primary-color)' : 'var(--text-secondary)'};
  margin-right: 4px;
`;

const UnreadBadge = styled.div`
  background-color: var(--unread-badge);
  color: white;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 6px;
`;

const ContextMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 10px;
  background-color: var(--dropdown-background);
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: ${props => props.show ? 'block' : 'none'};
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  svg {
    margin-right: 10px;
    font-size: 16px;
  }
`;

const ChatListItem = ({ contact, lastMessage, unreadCount, onClick, isSelected }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef(null);
  const { archiveChat } = useChat();
  
  const getMessageStatusIcon = (status) => {
    if (status === 'sent') return <FaCheck />;
    if (status === 'delivered') return <FaCheck />;
    if (status === 'read') return <FaCheckDouble />;
    return null;
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };
  
  const handleArchive = (e) => {
    e.stopPropagation();
    archiveChat(contact.id);
    setShowContextMenu(false);
  };
  
  const handleClickOutside = (e) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
      setShowContextMenu(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <ListItem 
      onClick={onClick} 
      isSelected={isSelected}
      onContextMenu={handleContextMenu}
    >
      <Avatar src={contact.avatar} alt={contact.name} />
      <ChatInfo>
        <TopRow>
          <ContactName unread={unreadCount > 0}>{contact.name}</ContactName>
          <TimeStamp unread={unreadCount > 0}>
            {lastMessage ? formatChatListDate(lastMessage.timestamp) : ''}
          </TimeStamp>
        </TopRow>
        <BottomRow>
          <LastMessage unread={unreadCount > 0}>
            {lastMessage ? (
              <>
                {lastMessage.senderId === 1 && (
                  <MessageStatus read={lastMessage.status === 'read'}>
                    {getMessageStatusIcon(lastMessage.status)}
                  </MessageStatus>
                )}
                {lastMessage.text}
              </>
            ) : (
              contact.status
            )}
          </LastMessage>
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </BottomRow>
      </ChatInfo>
      
      <ContextMenu show={showContextMenu} ref={contextMenuRef}>
        <MenuItem onClick={handleArchive}>
          <FaArchive />
          Archive chat
        </MenuItem>
        <MenuItem>
          <FaVolumeOff />
          Mute notifications
        </MenuItem>
        <MenuItem>
          <FaTrash />
          Delete chat
        </MenuItem>
      </ContextMenu>
    </ListItem>
  );
};

export default ChatListItem;
