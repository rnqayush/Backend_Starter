import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { getContactById, currentUser } from '../../data/mockData';

const ReplyContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--sidebar-header);
  border-left: 4px solid var(--primary-color);
`;

const ReplyContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;

const ReplyHeader = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.isCurrentUser ? 'var(--primary-color)' : 'var(--secondary-color)'};
  margin-bottom: 2px;
`;

const ReplyText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
`;

const CloseButton = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ReplyPreview = ({ message, onCancel, currentUserId }) => {
  const isCurrentUser = message.senderId === currentUserId;
  const sender = isCurrentUser 
    ? currentUser 
    : getContactById(message.senderId);
  
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };
  
  return (
    <ReplyContainer>
      <ReplyContent>
        <ReplyHeader isCurrentUser={isCurrentUser}>
          {isCurrentUser ? 'You' : sender?.name}
        </ReplyHeader>
        <ReplyText>
          {message.image ? '[Image]' : truncateText(message.text)}
        </ReplyText>
      </ReplyContent>
      <CloseButton onClick={onCancel}>
        <FaTimes />
      </CloseButton>
    </ReplyContainer>
  );
};

export default ReplyPreview;

