import React from 'react';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';
import { currentUser } from '../../data/mockData';

const StatusItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--sidebar-background);
  
  &:hover {
    background-color: var(--chat-hover);
  }
`;

const StatusAvatar = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: ${props => props.hasStory ? '2px solid var(--primary-color)' : 'none'};
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AddButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const StatusInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StatusTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatusDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const StatusItem = ({ onStatusClick }) => {
  const { stories } = useStory();
  
  // Check if current user has any stories
  const userStories = stories.filter(story => story.userId === currentUser.id);
  const hasStory = userStories.length > 0;
  
  return (
    <StatusItemContainer onClick={onStatusClick}>
      <StatusAvatar hasStory={hasStory}>
        <Avatar src={currentUser.avatar} alt="My Status" />
        <AddButton>
          <FaPlus />
        </AddButton>
      </StatusAvatar>
      <StatusInfo>
        <StatusTitle>My Status</StatusTitle>
        <StatusDescription>
          {hasStory ? 'Tap to view your status updates' : 'Tap to add status update'}
        </StatusDescription>
      </StatusInfo>
    </StatusItemContainer>
  );
};

export default StatusItem;

