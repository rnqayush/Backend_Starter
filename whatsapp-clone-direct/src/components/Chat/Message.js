import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { formatMessageTime, getContactById, currentUser } from '../../data/mockData';
import { FaCheck, FaCheckDouble, FaClock, FaReply, FaStar } from 'react-icons/fa';
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

const ReplyPreviewContainer = styled.div`
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background-color: ${props => props.isSentByMe ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-left: 3px solid var(--primary-color);
`;

const ReplyPreviewSender = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.isCurrentUser ? 'var(--primary-color)' : 'var(--secondary-color)'};
  margin-bottom: 2px;
`;

const ReplyPreviewText = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const MessageActions = styled.div`
  display: flex;
  position: absolute;
  top: -20px;
  ${props => props.isSentByMe ? 'right: 0;' : 'left: 0;'}
  background-color: var(--sidebar-header);
  border-radius: 15px;
  padding: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MessageContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const StarredIcon = styled(FaStar)`
  color: var(--primary-color);
  margin-left: 4px;
  font-size: 12px;
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
  color: ${props => props.status === 'read' ? 'var(--primary-color)' : 'var(--message-status)'};
  margin-left: 2px;
`;

const MessageImage = styled.img`
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
`;

const Message = ({ message, isSentByMe, onReply }) => {
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
        return <FaCheck title="Sent" />;
      case 'delivered':
        return <FaCheckDouble title="Delivered" />;
      case 'read':
        return <FaCheckDouble title="Read" style={{ color: '#53bdeb' }} />;
      default:
        return <FaClock title="Pending" />;
    }
  };

  // Render reply preview if message is a reply
  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    
    const repliedToSenderId = message.replyTo.senderId;
    const isRepliedToCurrentUser = repliedToSenderId === 1;
    const repliedToSender = isRepliedToCurrentUser 
      ? currentUser 
      : getContactById(repliedToSenderId);
    
    return (
      <ReplyPreviewContainer isSentByMe={isSentByMe}>
        <ReplyPreviewSender isCurrentUser={isRepliedToCurrentUser}>
          {isRepliedToCurrentUser ? 'You' : repliedToSender?.name}
        </ReplyPreviewSender>
        <ReplyPreviewText>
          {message.replyTo.text}
        </ReplyPreviewText>
      </ReplyPreviewContainer>
    );
  };

  return (
    <MessageContainer 
      isSentByMe={isSentByMe}
      ref={messageRef}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      <MessageActions isSentByMe={isSentByMe}>
        <ActionButton onClick={() => onReply(message)} title="Reply">
          <FaReply />
        </ActionButton>
      </MessageActions>
      
      <MessageBubble isSentByMe={isSentByMe}>
        {renderReplyPreview()}
        
        {message.image && (
          <MessageImage src={message.image} alt="Shared image" />
        )}
        <MessageText>
          {message.text}
        </MessageText>
        <MessageMeta>
          <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
          {message.isStarred && <StarredIcon title="Starred message" />}
          {isSentByMe && (
            <MessageStatus status={message.status}>
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
