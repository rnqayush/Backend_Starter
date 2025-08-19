import React from 'react';
import styled from 'styled-components';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';
import { formatMessageTime } from '../../data/mockData';

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.isOutgoing ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
  position: relative;
`;

const MessageBubble = styled.div`
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 7.5px;
  position: relative;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  background-color: ${props => props.isOutgoing ? 'var(--outgoing-message)' : 'var(--incoming-message)'};
  border-top-right-radius: ${props => props.isOutgoing ? '0' : '7.5px'};
  border-top-left-radius: ${props => props.isOutgoing ? '7.5px' : '0'};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    width: 12px;
    height: 12px;
    ${props => props.isOutgoing 
      ? 'right: -6px; background: radial-gradient(circle at 0 0, transparent 50%, var(--outgoing-message) 0) 100% 0/12px 12px no-repeat;' 
      : 'left: -6px; background: radial-gradient(circle at 100% 0, transparent 50%, var(--incoming-message) 0) 0 0/12px 12px no-repeat;'
    }
  }
  
  @media (max-width: 768px) {
    max-width: 80%;
  }
`;

const MessageText = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  word-wrap: break-word;
`;

const MessageMeta = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
  gap: 4px;
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: 4px;
`;

const MessageStatus = styled.div`
  font-size: 11px;
  color: ${props => props.read ? 'var(--primary-color)' : 'var(--text-secondary)'};
`;

const Message = ({ message, isOutgoing }) => {
  const getMessageStatusIcon = (status) => {
    if (status === 'sent') return <FaCheck />;
    if (status === 'delivered') return <FaCheck />;
    if (status === 'read') return <FaCheckDouble />;
    return null;
  };

  return (
    <MessageContainer isOutgoing={isOutgoing}>
      <MessageBubble isOutgoing={isOutgoing}>
        <MessageText>{message.text}</MessageText>
        <MessageMeta>
          <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
          {isOutgoing && (
            <MessageStatus read={message.status === 'read'}>
              {getMessageStatusIcon(message.status)}
            </MessageStatus>
          )}
        </MessageMeta>
      </MessageBubble>
    </MessageContainer>
  );
};

export default Message;

