import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaTimes, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';
import { currentUser, getContactById } from '../../data/mockData';

const StoryViewerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StoryContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${props => props.backgroundColor || '#000'};
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoryText = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${props => props.fontColor || '#fff'};
`;

const StoryHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
`;

const StoryAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const StoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StoryName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const StoryTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const CloseButton = styled.div`
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
`;

const DeleteButton = styled.div`
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin-left: 15px;
  display: ${props => props.isVisible ? 'block' : 'none'};
`;

const StoryCaption = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  color: #fff;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  font-size: 16px;
`;

const ProgressContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  display: flex;
  padding: 0 15px;
  gap: 5px;
`;

const ProgressBar = styled.div`
  height: 3px;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: #fff;
  transition: width 0.1s linear;
`;

const NavigationButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 10px;' : 'right: 10px;'}
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

const formatStoryTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }
};

const StoryViewer = () => {
  const { 
    activeStory, 
    activeStoryIndex, 
    setActiveStoryIndex, 
    setShowStoryViewer,
    viewStory,
    deleteStoryContent
  } = useStory();
  
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef(null);
  const storyDuration = 5000; // 5 seconds per story
  const progressStep = 100 / (storyDuration / 100); // Progress increment per 100ms
  
  const currentContent = activeStory?.content[activeStoryIndex];
  const storyOwner = activeStory?.userId === currentUser.id 
    ? currentUser 
    : getContactById(activeStory?.userId);
  const isMyStory = activeStory?.userId === currentUser.id;
  
  // Handle story navigation
  const handleNext = () => {
    if (activeStoryIndex < activeStory.content.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      // Move to the next user's story or close if this is the last one
      setShowStoryViewer(false);
    }
  };
  
  const handlePrevious = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };
  
  const handleClose = () => {
    setShowStoryViewer(false);
  };
  
  const handleDelete = () => {
    if (isMyStory && currentContent) {
      deleteStoryContent(currentContent.id);
    }
  };
  
  const handlePause = () => {
    setIsPaused(true);
  };
  
  const handleResume = () => {
    setIsPaused(false);
  };
  
  // Mark story as viewed
  useEffect(() => {
    if (activeStory && currentContent) {
      viewStory(activeStory.id, currentContent.id);
    }
  }, [activeStory, currentContent, viewStory]);
  
  // Progress bar animation
  useEffect(() => {
    if (!isPaused) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            handleNext();
            return 0;
          }
          return prev + progressStep;
        });
      }, 100);
    } else {
      clearInterval(progressInterval.current);
    }
    
    return () => clearInterval(progressInterval.current);
  }, [activeStoryIndex, isPaused]);
  
  if (!activeStory || !currentContent) {
    return null;
  }
  
  return (
    <StoryViewerContainer 
      onMouseDown={handlePause} 
      onMouseUp={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
    >
      <StoryContent backgroundColor={currentContent.backgroundColor}>
        {/* Progress bars */}
        <ProgressContainer>
          {activeStory.content.map((_, index) => (
            <ProgressBar key={index}>
              <Progress 
                progress={index === activeStoryIndex ? progress : (index < activeStoryIndex ? 100 : 0)} 
              />
            </ProgressBar>
          ))}
        </ProgressContainer>
        
        {/* Story header */}
        <StoryHeader>
          <StoryAvatar src={storyOwner?.avatar} alt={storyOwner?.name} />
          <StoryInfo>
            <StoryName>{storyOwner?.name}</StoryName>
            <StoryTime>{formatStoryTime(currentContent.timestamp)}</StoryTime>
          </StoryInfo>
          <DeleteButton isVisible={isMyStory} onClick={handleDelete}>
            <FaTrash />
          </DeleteButton>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </StoryHeader>
        
        {/* Story content */}
        {currentContent.type === 'image' ? (
          <StoryImage src={currentContent.url} alt="Story" />
        ) : (
          <StoryText fontColor={currentContent.fontColor}>
            {currentContent.text}
          </StoryText>
        )}
        
        {/* Caption */}
        {currentContent.caption && (
          <StoryCaption>{currentContent.caption}</StoryCaption>
        )}
        
        {/* Navigation buttons */}
        {activeStoryIndex > 0 && (
          <NavigationButton 
            direction="left" 
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <FaChevronLeft />
          </NavigationButton>
        )}
        
        {activeStoryIndex < activeStory.content.length - 1 && (
          <NavigationButton 
            direction="right" 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <FaChevronRight />
          </NavigationButton>
        )}
      </StoryContent>
    </StoryViewerContainer>
  );
};

export default StoryViewer;

