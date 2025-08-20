import React from 'react';
import styled from 'styled-components';
import { formatMessageTime, currentUser } from '../../data/mockData';
import { useStory } from '../../contexts/StoryContext';

const ListItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-right: 16px;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: ${props => props.isOwn ? '3px solid var(--primary-color)' : 'none'};
`;

const StatusRing = styled.div`
  position: absolute;
  top: -3px;
  left: -3px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid ${props => props.isViewed ? 'var(--status-viewed)' : 'var(--primary-color)'};
  border-style: ${props => props.isSegmented ? 'dashed' : 'solid'};
`;

const AddButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
`;

const InfoContainer = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatusInfo = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
`;

const TimeInfo = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  min-width: 55px;
  text-align: right;
`;

const StatusListItem = ({ story, isOwn, onClick }) => {
  const { hasUnviewedStories } = useStory();
  
  // Get the most recent content item
  const latestContent = story.content.reduce((latest, current) => {
    return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
  }, story.content[0]);
  
  // Check if all content items have been viewed
  const allViewed = !hasUnviewedStories(story.userId);
  
  // For the current user's status
  const hasStatus = story.content.length > 0;
  
  const handleClick = () => {
    if (onClick) {
      onClick(story);
    }
  };
  
  return (
    <ListItemContainer onClick={handleClick}>
      <AvatarContainer>
        <Avatar 
          src={isOwn ? currentUser.avatar : story.userAvatar} 
          alt={isOwn ? currentUser.name : story.userName}
          isOwn={isOwn && !hasStatus}
        />
        
        {(hasStatus || !isOwn) && (
          <StatusRing 
            isViewed={allViewed} 
            isSegmented={story.content.length > 1}
          />
        )}
        
        {isOwn && (
          <AddButton>
            {hasStatus ? '＋' : '＋'}
          </AddButton>
        )}
      </AvatarContainer>
      
      <InfoContainer>
        <Name>{isOwn ? 'My Status' : story.userName}</Name>
        <StatusInfo>
          {isOwn && !hasStatus 
            ? 'Tap to add status update' 
            : `${formatMessageTime(latestContent.timestamp)}`}
        </StatusInfo>
      </InfoContainer>
      
      {!isOwn && (
        <TimeInfo>
          {new Date(latestContent.timestamp).toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric' 
          })}
        </TimeInfo>
      )}
    </ListItemContainer>
  );
};

export default StatusListItem;

