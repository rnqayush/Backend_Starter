import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaTimes, FaReply, FaHeart, FaEllipsisV } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';
import { formatTimestamp } from '../../utils/formatters';
import { getContactById, currentUser } from '../../data/mockData';

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
  background-color: ${props => props.backgroundColor || '#075E54'};
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoryText = styled.div`
  padding: 20px;
  font-size: ${props => props.fontSize || '24px'};
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
  color: ${props => props.color || 'white'};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const StoryHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 15px;
  z-index: 10;
`;

const ProgressContainer = styled.div`
  display: flex;
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
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
  background-color: white;
  transition: width 0.1s linear;
`;

const BackButton = styled.div`
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
  z-index: 20;
`;

const CloseButton = styled.div`
  color: white;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 20;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  color: white;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const UserName = styled.div`
  font-weight: 500;
`;

const Timestamp = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const StoryFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 15px;
  z-index: 10;
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border-radius: 20px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  margin-right: 10px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
  }
`;

const ActionButton = styled.div`
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 15px;
`;

const NavigationOverlay = styled.div`
  position: absolute;
  top: 60px;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  z-index: 5;
`;

const NavigationHalf = styled.div`
  flex: 1;
  cursor: pointer;
`;

const StoryViewer = () => {
  const { 
    activeStory, 
    setActiveStory, 
    activeStoryIndex, 
    setActiveStoryIndex, 
    setShowStoryViewer,
    stories,
    viewStory
  } = useStory();
  
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const progressInterval = useRef(null);
  const storyDuration = 5000; // 5 seconds per story
  const updateInterval = 100; // Update progress every 100ms
  
  const currentStory = activeStory?.content[activeStoryIndex];
  const user = activeStory?.userId === currentUser.id 
    ? currentUser 
    : getContactById(activeStory?.userId);
  
  useEffect(() => {
    if (!currentStory) return;
    
    // Mark the story as viewed
    if (activeStory) {
      viewStory(activeStory.id, currentStory.id);
    }
    
    // Reset progress
    setProgress(0);
    
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    // Set up new interval
    progressInterval.current = setInterval(() => {
      if (!paused) {
        setProgress(prev => {
          const newProgress = prev + (updateInterval / storyDuration) * 100;
          
          // Move to next story when progress reaches 100%
          if (newProgress >= 100) {
            handleNextStory();
            return 0;
          }
          
          return newProgress;
        });
      }
    }, updateInterval);
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [activeStoryIndex, activeStory, paused]);
  
  const handleClose = () => {
    setShowStoryViewer(false);
    setActiveStory(null);
    setActiveStoryIndex(0);
  };
  
  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      // Previous content in the same story
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      // Previous story
      const currentStoryIndex = stories.findIndex(s => s.id === activeStory.id);
      if (currentStoryIndex > 0) {
        const prevStory = stories[currentStoryIndex - 1];
        setActiveStory(prevStory);
        setActiveStoryIndex(prevStory.content.length - 1);
      }
    }
  };
  
  const handleNextStory = () => {
    if (activeStoryIndex < activeStory.content.length - 1) {
      // Next content in the same story
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      // Next story
      const currentStoryIndex = stories.findIndex(s => s.id === activeStory.id);
      if (currentStoryIndex < stories.length - 1) {
        const nextStory = stories[currentStoryIndex + 1];
        setActiveStory(nextStory);
        setActiveStoryIndex(0);
      } else {
        // End of all stories
        handleClose();
      }
    }
  };
  
  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };
  
  const handleReplySubmit = (e) => {
    if (e.key === 'Enter' && replyText.trim()) {
      // Send reply logic would go here
      console.log(`Reply to ${user.name}'s story: ${replyText}`);
      setReplyText('');
    }
  };
  
  const handlePause = () => {
    setPaused(true);
  };
  
  const handleResume = () => {
    setPaused(false);
  };
  
  if (!activeStory || !currentStory) {
    return null;
  }
  
  return (
    <StoryViewerContainer>
      <StoryContent 
        backgroundColor={currentStory.type === 'text' ? currentStory.backgroundColor : undefined}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        <ProgressContainer>
          {activeStory.content.map((_, index) => (
            <ProgressBar key={index}>
              <Progress 
                progress={index === activeStoryIndex ? progress : (index < activeStoryIndex ? 100 : 0)} 
              />
            </ProgressBar>
          ))}
        </ProgressContainer>
        
        <StoryHeader>
          <BackButton onClick={handleClose}>
            <FaArrowLeft />
          </BackButton>
          <UserInfo>
            <Avatar src={user.avatar} alt={user.name} />
            <div>
              <UserName>{user.name}</UserName>
              <Timestamp>{formatTimestamp(currentStory.timestamp)}</Timestamp>
            </div>
          </UserInfo>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </StoryHeader>
        
        {currentStory.type === 'image' ? (
          <StoryImage src={currentStory.content} alt="Story" />
        ) : (
          <StoryText 
            color={currentStory.textColor}
            fontSize={currentStory.fontSize}
            fontFamily={currentStory.fontFamily}
          >
            {currentStory.content}
          </StoryText>
        )}
        
        <NavigationOverlay>
          <NavigationHalf onClick={handlePrevStory} />
          <NavigationHalf onClick={handleNextStory} />
        </NavigationOverlay>
        
        <StoryFooter>
          <ReplyInput 
            placeholder="Reply to story..." 
            value={replyText}
            onChange={handleReplyChange}
            onKeyPress={handleReplySubmit}
          />
          <ActionButton title="React">
            <FaHeart />
          </ActionButton>
          <ActionButton title="More">
            <FaEllipsisV />
          </ActionButton>
        </StoryFooter>
      </StoryContent>
    </StoryViewerContainer>
  );
};

export default StoryViewer;

