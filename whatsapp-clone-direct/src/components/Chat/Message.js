import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { formatMessageTime } from '../../data/mockData';
import { FaCheck, FaCheckDouble, FaClock } from 'react-icons/fa';
import MessageContextMenu from './MessageContextMenu';

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.isSentByMe ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
  position: relative;
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isSentByMe ? 'var(--outgoing-message)' : 'var(--incoming-message)'};
  border-radius: 7.5px;
  padding: 6px 7px 8px 9px;
  max-width: 65%;
  position: relative;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    width: 12px;
    height: 12px;
    ${props => props.isSentByMe ? 
      'right: -6px; background: radial-gradient(circle at 0 0, transparent 12px, var(--outgoing-message) 0);' : 
      'left: -6px; background: radial-gradient(circle at 100% 0, transparent 12px, var(--incoming-message) 0);'
    }
  }
`;

const MessageText = styled.div`
  font-size: 14.2px;
  color: var(--text-primary);
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 2px;
  min-height: 15px;
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  margin-right: 4px;
`;

const MessageStatus = styled.span`
  font-size: 11px;
  color: var(--message-status);
  margin-left: 2px;
`;

const MessageImage = styled.img`
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
`;

const Message = ({ message, isSentByMe }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = messageRef.current.getBoundingClientRect();
    setContextMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setShowContextMenu(true);
  };

  const handleClick = () => {
    if (showContextMenu) {
      setShowContextMenu(false);
    }
  };

  const renderMessageStatus = () => {
    switch (message.status) {
      case 'sent':
        return <FaCheck />;
      case 'delivered':
        return <FaCheckDouble />;
      case 'read':
        return <FaCheckDouble style={{ color: '#53bdeb' }} />;
      default:
        return <FaClock />;
    }
  };

  return (
    <MessageContainer 
      isSentByMe={isSentByMe}
      ref={messageRef}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      <MessageBubble isSentByMe={isSentByMe}>
        {message.image && (
          <MessageImage src={message.image} alt="Shared image" />
        )}
        <MessageText>
          {message.text}
        </MessageText>
        <MessageMeta>
          <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
          {isSentByMe && (
            <MessageStatus>
              {renderMessageStatus()}
            </MessageStatus>
          )}
        </MessageMeta>
      </MessageBubble>
      
      {showContextMenu && (
        <MessageContextMenu 
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
          message={message}
          isSentByMe={isSentByMe}
        />
      )}
    </MessageContainer>
  );
};

export default Message;

