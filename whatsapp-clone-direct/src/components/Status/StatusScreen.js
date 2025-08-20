import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaEllipsisV, FaCamera, FaPencilAlt, FaLock } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';
import { currentUser } from '../../data/mockData';
import StatusListItem from './StatusListItem';
import StatusViewer from './StatusViewer';
import StatusCreator from './StatusCreator';

const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  height: 60px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    font-size: 19px;
    font-weight: 500;
    margin-left: 24px;
  }
`;

const BackButton = styled.div`
  cursor: pointer;
  font-size: 18px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.div`
  margin-left: 24px;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SectionTitle = styled.div`
  padding: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  background-color: var(--background);
  font-weight: 500;
`;

const PrivacyFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  
  svg {
    margin-right: 8px;
    font-size: 12px;
  }
`;

const FloatingActionButton = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10;
`;

const FloatingActionButtonSmall = styled.div`
  position: fixed;
  bottom: 84px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--background-lighter);
  color: var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 10;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  height: 100%;
  color: var(--text-secondary);
`;

const EmptyStateTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  max-width: 300px;
  line-height: 1.5;
`;

const StatusScreen = ({ onClose }) => {
  const { 
    stories, 
    setActiveStory, 
    setActiveStoryIndex,
    setShowStoryViewer,
    setShowStoryCreator,
    hasUnviewedStories
  } = useStory();
  
  const [showViewer, setShowViewer] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [creatorType, setCreatorType] = useState('image'); // 'image' or 'text'
  
  // Get current user's story
  const myStory = stories.find(story => story.userId === currentUser.id) || {
    userId: currentUser.id,
    content: []
  };
  
  // Get other users' stories
  const recentUpdates = stories.filter(story => 
    story.userId !== currentUser.id && 
    story.content.some(item => !item.viewers.includes(currentUser.id))
  );
  
  const viewedUpdates = stories.filter(story => 
    story.userId !== currentUser.id && 
    story.content.every(item => item.viewers.includes(currentUser.id))
  );
  
  const handleStoryClick = (story, index) => {
    setActiveStory(story);
    setActiveStoryIndex(index);
    setShowViewer(true);
    setShowStoryViewer(true);
  };
  
  const handleMyStoryClick = () => {
    if (myStory.content.length > 0) {
      setActiveStory(myStory);
      setActiveStoryIndex(0);
      setShowViewer(true);
      setShowStoryViewer(true);
    } else {
      // Show options to create a new status
      setShowCreator(true);
      setCreatorType('image');
      setShowStoryCreator(true);
    }
  };
  
  const handleCameraClick = () => {
    setShowCreator(true);
    setCreatorType('image');
    setShowStoryCreator(true);
  };
  
  const handleTextClick = () => {
    setShowCreator(true);
    setCreatorType('text');
    setShowStoryCreator(true);
  };
  
  const handleCloseViewer = () => {
    setShowViewer(false);
    setShowStoryViewer(false);
  };
  
  const handleCloseCreator = () => {
    setShowCreator(false);
    setShowStoryCreator(false);
  };
  
  // Prepare story data for StatusListItem
  const prepareStoryData = (story) => {
    const user = story.userId === currentUser.id 
      ? currentUser 
      : { 
          avatar: `https://randomuser.me/api/portraits/men/${story.userId}.jpg`,
          name: `User ${story.userId}`
        };
    
    return {
      ...story,
      userAvatar: user.avatar,
      userName: user.name
    };
  };
  
  return (
    <ScreenContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Status</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaEllipsisV />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <ContentContainer>
        {/* My Status */}
        <StatusListItem 
          story={prepareStoryData(myStory)} 
          isOwn={true}
          onClick={handleMyStoryClick}
        />
        
        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <>
            <SectionTitle>Recent updates</SectionTitle>
            {recentUpdates.map((story, index) => (
              <StatusListItem 
                key={story.id}
                story={prepareStoryData(story)}
                isOwn={false}
                onClick={() => handleStoryClick(story, index)}
              />
            ))}
          </>
        )}
        
        {/* Viewed Updates */}
        {viewedUpdates.length > 0 && (
          <>
            <SectionTitle>Viewed updates</SectionTitle>
            {viewedUpdates.map((story, index) => (
              <StatusListItem 
                key={story.id}
                story={prepareStoryData(story)}
                isOwn={false}
                onClick={() => handleStoryClick(story, recentUpdates.length + index)}
              />
            ))}
          </>
        )}
        
        {/* Empty State */}
        {recentUpdates.length === 0 && viewedUpdates.length === 0 && (
          <EmptyStateContainer>
            <EmptyStateTitle>No status updates</EmptyStateTitle>
            <EmptyStateText>
              When your contacts update their status, you'll see them here.
            </EmptyStateText>
          </EmptyStateContainer>
        )}
        
        <PrivacyFooter>
          <FaLock />
          Your status updates are end-to-end encrypted
        </PrivacyFooter>
      </ContentContainer>
      
      {/* Floating Action Buttons */}
      <FloatingActionButtonSmall onClick={handleTextClick}>
        <FaPencilAlt />
      </FloatingActionButtonSmall>
      <FloatingActionButton onClick={handleCameraClick}>
        <FaCamera />
      </FloatingActionButton>
      
      {/* Status Viewer */}
      {showViewer && (
        <StatusViewer onClose={handleCloseViewer} />
      )}
      
      {/* Status Creator */}
      {showCreator && (
        <StatusCreator 
          type={creatorType} 
          onClose={handleCloseCreator} 
        />
      )}
    </ScreenContainer>
  );
};

export default StatusScreen;

