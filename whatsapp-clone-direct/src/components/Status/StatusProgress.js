import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  display: flex;
  width: 100%;
  height: 3px;
  gap: 4px;
  position: absolute;
  top: 12px;
  left: 0;
  padding: 0 16px;
  z-index: 10;
`;

const ProgressSegment = styled.div`
  flex: 1;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 1.5px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: white;
  width: ${props => props.progress}%;
  transition: width ${props => props.isPaused ? '0s' : '0.1s'} linear;
`;

const StatusProgress = ({ 
  totalItems, 
  currentIndex, 
  duration = 5000, 
  isPaused, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [activeSegment, setActiveSegment] = useState(currentIndex);
  const intervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  
  // Reset progress when changing stories
  useEffect(() => {
    setProgress(0);
    setActiveSegment(currentIndex);
    lastUpdateTimeRef.current = Date.now();
  }, [currentIndex]);
  
  // Handle progress updates
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set the last update time to now
    lastUpdateTimeRef.current = Date.now();
    
    // Create a new interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = now;
      
      setProgress(prev => {
        const newProgress = prev + (delta / duration) * 100;
        
        if (newProgress >= 100) {
          // Move to next segment
          if (activeSegment === totalItems - 1) {
            // Last segment completed
            if (onComplete) {
              clearInterval(intervalRef.current);
              onComplete();
            }
          }
          return 100;
        }
        
        return newProgress;
      });
    }, 100); // Update every 100ms for smoother animation
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, duration, activeSegment, totalItems, onComplete]);
  
  // When progress reaches 100%, move to next segment
  useEffect(() => {
    if (progress >= 100 && activeSegment === currentIndex) {
      if (onComplete) {
        onComplete();
      }
    }
  }, [progress, activeSegment, currentIndex, onComplete]);
  
  return (
    <ProgressContainer>
      {Array.from({ length: totalItems }).map((_, index) => (
        <ProgressSegment key={index}>
          {index < currentIndex ? (
            <ProgressFill progress={100} isPaused={true} />
          ) : index === currentIndex ? (
            <ProgressFill progress={progress} isPaused={isPaused} />
          ) : (
            <ProgressFill progress={0} isPaused={true} />
          )}
        </ProgressSegment>
      ))}
    </ProgressContainer>
  );
};

export default StatusProgress;

