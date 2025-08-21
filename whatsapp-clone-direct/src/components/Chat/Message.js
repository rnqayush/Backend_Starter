import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { formatMessageTime, getContactById, currentUser } from '../../data/mockData';
import { FaCheck, FaCheckDouble, FaClock, FaReply, FaStar, FaMicrophone, FaSmile, FaLock } from 'react-icons/fa';
import MessageContextMenu from './MessageContextMenu';
import AudioPlayer from './AudioPlayer';
import MessageReactions from './MessageReactions';
import ReactionsPopup from './ReactionsPopup';
import PollMessage from './PollMessage';
import DocumentMessage from './DocumentMessage';
import MediaMessage from './MediaMessage';
import LocationMessage from './LocationMessage';
import ContactMessage from './ContactMessage';
import GifMessage from './GifMessage';
import StickerMessage from './StickerMessage';
import VoiceMessage from './VoiceMessage';
import { formatMessageText, renderFormattedText } from '../../utils/messageFormatter';

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
  
  strong {
    font-weight: bold;
  }
  
  em {
    font-style: italic;
  }
  
  del {
    text-decoration: line-through;
  }
  
  code {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
  }
`;

const EncryptionIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
  
  svg {
    margin-right: 4px;
    font-size: 10px;
  }
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

const AudioContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const AudioIcon = styled.div`
  margin-right: 8px;
  color: var(--icon-color);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageActionButtons = styled.div`
  position: absolute;
  top: -30px;
  right: ${props => props.isSentByMe ? '0' : 'auto'};
  left: ${props => props.isSentByMe ? 'auto' : '0'};
  background-color: var(--dropdown-background);
  border-radius: 15px;
  display: ${props => props.show ? 'flex' : 'none'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  z-index: 5;
`;

const ActionButtonItem = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-color);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;



const Message = ({ message, isSentByMe, onReply }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [showActions, setShowActions] = useState(false);
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

  const handleMouseEnter = () => {
    setShowActions(true);
  };
  
  const handleMouseLeave = () => {
    setShowActions(false);
  };
  
  const handleClick = () => {
    if (showContextMenu) {
      setShowContextMenu(false);
    }
    if (showReactionsPopup) {
      setShowReactionsPopup(false);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MessageActionButtons isSentByMe={isSentByMe} show={showActions}>
        <ActionButtonItem onClick={() => onReply(message)} title="Reply">
          <FaReply />
        </ActionButtonItem>
        <ActionButtonItem onClick={() => setShowReactionsPopup(true)} title="React">
          <FaSmile />
        </ActionButtonItem>
      </MessageActionButtons>
      
      <MessageBubble isSentByMe={isSentByMe}>
        {renderReplyPreview()}
        
        {message.image && !message.type && (
          <MessageImage src={message.image} alt="Shared image" />
        )}
        
        {message.type === 'voice' ? (
          <VoiceMessage message={message} isSentByMe={isSentByMe} />
        ) : message.audio && !message.type && (
          <AudioContainer>
            <AudioIcon>
              <FaMicrophone />
            </AudioIcon>
            <AudioPlayer audioUrl={message.audio} />
          </AudioContainer>
        )}
        
        {message.type === 'document' && (
          <DocumentMessage document={message.document || {
            name: message.name,
            url: message.url || message.file,
            size: message.size,
            type: message.fileType
          }} />
        )}
        
        {message.type === 'media' && (
          <MediaMessage media={message.media || {
            url: message.url || message.image || message.video,
            name: message.name,
            size: message.size,
            type: message.image ? 'image/jpeg' : 'video/mp4'
          }} />
        )}
        
        {message.type === 'location' && (
          <LocationMessage location={message.location} />
        )}
        
        {message.type === 'contact' && (
          <ContactMessage contact={message.contact} />
        )}
        
        {message.type === 'gif' && (
          <GifMessage gif={message.gif || {
            url: message.url,
            name: message.name
          }} />
        )}
        
        {message.type === 'sticker' && (
          <StickerMessage sticker={message.sticker || {
            url: message.url,
            name: message.name
          }} />
        )}
        {message.type === 'poll' && (
          <PollMessage 
            poll={message.poll} 
            pollId={message.pollId}
            chatId={message.chatId || 1}
            isSentByMe={isSentByMe}
          />
        )}
        
        {message.text && (
          <MessageText>
            {renderFormattedText(formatMessageText(message.text))}
          </MessageText>
        )}
        
        <EncryptionIndicator>
          <FaLock />
          End-to-end encrypted
        </EncryptionIndicator>
        <MessageMeta>
          <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
          {message.isStarred && <StarredIcon title="Starred message" />}
          {isSentByMe && (
            <MessageStatus status={message.status}>
              {renderMessageStatus()}
            </MessageStatus>
          )}
        </MessageMeta>
        
        {/* Display message reactions if any */}
        <MessageReactions message={message} isSentByMe={isSentByMe} />
        
        {/* Show reactions popup when the reaction button is clicked */}
        {showReactionsPopup && (
          <ReactionsPopup 
            message={message} 
            onClose={() => setShowReactionsPopup(false)}
          />
        )}
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
