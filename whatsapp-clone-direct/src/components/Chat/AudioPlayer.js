import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';

const PlayerContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--audio-player-background);
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  max-width: 280px;
`;

const PlayButton = styled.div`
  margin-right: 10px;
  cursor: pointer;
  color: var(--icon-color);
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ProgressContainer = styled.div`
  flex: 1;
  height: 4px;
  background-color: var(--audio-player-track);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: var(--audio-player-progress);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => props.progress}%;
`;

const ProgressThumb = styled.div`
  width: 12px;
  height: 12px;
  background-color: var(--audio-player-thumb);
  border-radius: 50%;
  position: absolute;
  top: -4px;
  left: ${props => props.progress}%;
  transform: translateX(-50%);
  display: ${props => props.dragging ? 'block' : 'none'};
  
  ${ProgressContainer}:hover & {
    display: block;
  }
`;

const TimeDisplay = styled.div`
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
`;

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging]);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleProgressClick = (e) => {
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (offsetX / width) * 100;
    const newTime = (percentage / 100) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <PlayerContainer>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <PlayButton onClick={togglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </PlayButton>
      
      <ProgressContainer 
        ref={progressRef}
        onClick={handleProgressClick}
      >
        <ProgressBar progress={progress} />
        <ProgressThumb 
          progress={progress} 
          dragging={isDragging}
        />
      </ProgressContainer>
      
      <TimeDisplay>
        {formatTime(currentTime)}
      </TimeDisplay>
    </PlayerContainer>
  );
};

export default AudioPlayer;

