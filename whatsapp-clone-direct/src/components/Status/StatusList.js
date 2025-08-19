import React from 'react';
import styled from 'styled-components';
import { currentUser } from '../../data/mockData';
import { useStory } from '../../contexts/StoryContext';
import { FaPlus } from 'react-icons/fa';

const StatusListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--sidebar-background);
  overflow-y: auto;
`;

const StatusHeader = styled.div`
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const StatusAvatar = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  margin-right: 15px;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: ${props => props.isMyStatus ? 'none' : props.hasUnviewed ? '2px solid var(--primary-color)' : '2px solid var(--text-secondary)'};
`;

const AddStatusIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StatusName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatusTime = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const formatStatusTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
};

const StatusList = ({ onClose }) => {
  const { 
    stories, 
    setActiveStory, 
    setActiveStoryIndex, 
    setShowStoryViewer,
    setShowStoryCreator,
    hasUnviewedStories
  } = useStory();

  const handleStatusClick = (story) => {
    setActiveStory(story);
    setActiveStoryIndex(0);
    setShowStoryViewer(true);
  };

  const handleMyStatusClick = () => {
    const myStory = stories.find(story => story.userId === currentUser.id);
    
    if (myStory) {
      // If I already have a story, view it
      handleStatusClick(myStory);
    } else {
      // If I don't have a story, open the creator
      setShowStoryCreator(true);
    }
  };

  const getLatestStoryTimestamp = (story) => {
    if (!story || !story.content || story.content.length === 0) return null;
    
    const sortedContent = [...story.content].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return sortedContent[0].timestamp;
  };

  // Get my story
  const myStory = stories.find(story => story.userId === currentUser.id);
  const myStoryTimestamp = getLatestStoryTimestamp(myStory);

  // Get other users' stories
  const otherStories = stories.filter(story => story.userId !== currentUser.id);

  return (
    <StatusListContainer>
      <StatusHeader>Status</StatusHeader>
      
      {/* My Status */}
      <StatusItem onClick={handleMyStatusClick}>
        <StatusAvatar>
          <Avatar 
            src={currentUser.avatar} 
            alt={currentUser.name}
            isMyStatus={true}
          />
          <AddStatusIcon>
            <FaPlus />
          </AddStatusIcon>
        </StatusAvatar>
        <StatusInfo>
          <StatusName>My Status</StatusName>
          <StatusTime>
            {myStory ? formatStatusTime(myStoryTimestamp) : 'Tap to add status update'}
          </StatusTime>
        </StatusInfo>
      </StatusItem>
      
      {/* Recent Updates */}
      {otherStories.length > 0 && (
        <>
          <StatusHeader>Recent Updates</StatusHeader>
          {otherStories.map(story => {
            const contact = story.userId === currentUser.id 
              ? currentUser 
              : { id: story.userId, name: `User ${story.userId}` };
            const hasUnviewed = hasUnviewedStories(story.userId);
            const latestTimestamp = getLatestStoryTimestamp(story);
            
            return (
              <StatusItem 
                key={story.id} 
                onClick={() => handleStatusClick(story)}
              >
                <StatusAvatar>
                  <Avatar 
                    src={`https://randomuser.me/api/portraits/${story.userId % 2 === 0 ? 'women' : 'men'}/${story.userId}.jpg`} 
                    alt={contact.name}
                    hasUnviewed={hasUnviewed}
                  />
                </StatusAvatar>
                <StatusInfo>
                  <StatusName>{contact.name}</StatusName>
                  <StatusTime>{formatStatusTime(latestTimestamp)}</StatusTime>
                </StatusInfo>
              </StatusItem>
            );
          })}
        </>
      )}
    </StatusListContainer>
  );
};

export default StatusList;

