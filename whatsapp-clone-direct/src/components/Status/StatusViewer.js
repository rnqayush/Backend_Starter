import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaEye, FaReply, FaEllipsisV } from 'react-icons/fa';
import { formatMessageTime, getContactById, currentUser } from '../../data/mockData';
import StatusProgress from './StatusProgress';
import StatusReplyInput from './StatusReplyInput';
import StatusRemainingTime from './StatusRemainingTime';
import { useStory } from '../../contexts/StoryContext';
import { isStoryExpired } from '../../utils/statusUtils';

const ViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#000'};
`;

const ImageContent = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const TextContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${props => props.textColor || '#fff'};
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid #fff;
`;

const UserName = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 16px;
`;

const Timestamp = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 2px;
`;

const TimeRemainingContainer = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
`;

const ReplyContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 8px 16px;
  flex: 1;
  margin-right: 16px;
  cursor: pointer;
  
  svg {
    margin-right: 8px;
    color: #fff;
  }
`;

const ReplyText = styled.div`
  color: rgba(255, 255, 255, 0.7);
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  cursor: pointer;
  
  svg {
    margin-right: 8px;
  }
`;

const NavigationOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 5;
`;

const NavigationArea = styled.div`
  flex: 1;
  height: 100%;
  cursor: pointer;
`;

const Caption = styled.div`
  position: absolute;
  bottom: 80px;
  left: 0;
  width: 100%;
  padding: 0 16px;
  color: #fff;
  font-size: 16px;
  text-align: center;
  z-index: 5;
`;

const ViewersList = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 50%;
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
  z-index: 20;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
`;

const ViewersHeader = styled.div`
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const ViewerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
`;

const ViewerName = styled.div`
  margin-left: 12px;
  font-size: 16px;
  color: var(--text-primary);
`;

const StatusViewer = ({ onClose }) => {
  const { 
    stories, 
    activeStory, 
    activeStoryIndex, 
    setActiveStoryIndex,
    viewStory,
    addReply
  } = useStory();
  
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const contentRef = useRef(null);
  
  const story = activeStory;
  const content = story?.content[currentContentIndex];
  const user = story?.userId === currentUser.id 
    ? currentUser 
    : getContactById(story?.userId);
  
  // Mark story as viewed when displayed
  useEffect(() => {
    if (story && content) {
      viewStory(story.id, content.id);
    }
  }, [story, content, viewStory]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentContentIndex, activeStoryIndex]);
  
  const handleNext = () => {
    // If there are more content items in the current story
    if (currentContentIndex < story.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      // Move to the next story
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
        setCurrentContentIndex(0);
      } else {
        // End of all stories
        onClose();
      }
    }
  };
  
  const handlePrevious = () => {
    // If we're not at the first content item
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    } else {
      // Move to the previous story
      if (activeStoryIndex > 0) {
        setActiveStoryIndex(activeStoryIndex - 1);
        const prevStory = stories[activeStoryIndex - 1];
        setCurrentContentIndex(prevStory.content.length - 1);
      }
    }
  };
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  const toggleViewers = () => {
    setIsPaused(true);
    setShowViewers(!showViewers);
    if (showReplyInput) setShowReplyInput(false);
  };
  
  const closeViewers = () => {
    setShowViewers(false);
    setIsPaused(false);
  };
  
  const toggleReplyInput = () => {
    setIsPaused(true);
    setShowReplyInput(!showReplyInput);
    if (showViewers) setShowViewers(false);
  };
  
  const handleSendReply = (replyText) => {
    if (story && content) {
      addReply(story.id, content.id, replyText);
      setShowReplyInput(false);
      setIsPaused(false);
    }
  };
  
  if (!story || !content) {
    return null;
  }
  
  const viewersList = content.viewers.map(viewerId => {
    return viewerId === currentUser.id 
      ? currentUser 
      : getContactById(viewerId);
  }).filter(Boolean);
  
  return (
    <ViewerContainer>
      <ContentContainer 
        backgroundColor={content.type === 'text' ? content.backgroundColor : undefined}
        ref={contentRef}
      >
        <StatusProgress 
          totalItems={story.content.length}
          currentIndex={currentContentIndex}
          isPaused={isPaused}
          onComplete={handleNext}
        />
        
        <Header>
          <UserInfo>
            <Avatar src={user.avatar} alt={user.name} />
            <div>
              <UserName>{user.name}</UserName>
              <Timestamp>{formatMessageTime(content.timestamp)}</Timestamp>
              <TimeRemainingContainer>
                <StatusRemainingTime timestamp={content.timestamp} showIndicator={false} />
              </TimeRemainingContainer>
            </div>
          </UserInfo>
          <Actions>
            {story.userId === currentUser.id && (
              <ActionButton onClick={toggleViewers}>
                <FaEye />
              </ActionButton>
            )}
            <ActionButton onClick={onClose}>
              <FaArrowLeft />
            </ActionButton>
          </Actions>
        </Header>
        
        {content.type === 'image' ? (
          <ImageContent src={content.content} alt="Status" />
        ) : (
          <TextContent 
            textColor={content.textColor}
            fontFamily={content.fontFamily}
          >
            {content.content}
          </TextContent>
        )}
        
        {content.caption && (
          <Caption>{content.caption}</Caption>
        )}
        
        <Footer>
          <ReplyContainer onClick={toggleReplyInput}>
            <FaReply />
            <ReplyText>Reply</ReplyText>
          </ReplyContainer>
          {story.userId === currentUser.id && (
            <ViewCount onClick={toggleViewers}>
              <FaEye />
              {content.viewers.length}
            </ViewCount>
          )}
        </Footer>
        
        {showReplyInput && (
          <StatusReplyInput 
            onSendReply={handleSendReply} 
            onClose={() => {
              setShowReplyInput(false);
              setIsPaused(false);
            }}
          />
        )}
        
        <NavigationOverlay>
          <NavigationArea 
            onClick={handlePrevious}
            onMouseDown={handlePause}
            onMouseUp={handleResume}
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
          />
          <NavigationArea 
            onClick={handleNext}
            onMouseDown={handlePause}
            onMouseUp={handleResume}
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
          />
        </NavigationOverlay>
        
        <ViewersList isOpen={showViewers}>
          <ViewersHeader>Viewed by {content.viewers.length}</ViewersHeader>
          {viewersList.map(viewer => (
            <ViewerItem key={viewer.id}>
              <Avatar src={viewer.avatar} alt={viewer.name} />
              <ViewerName>{viewer.name}</ViewerName>
            </ViewerItem>
          ))}
        </ViewersList>
      </ContentContainer>
    </ViewerContainer>
  );
};

export default StatusViewer;
