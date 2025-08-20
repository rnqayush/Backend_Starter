import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';
import { formatAudioTime, generateWaveformData } from '../../utils/audioRecorder';

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
  margin: 0 4px;
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

const WaveformContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  height: 24px;
  gap: 2px;
  margin: 0 8px;
`;

const WaveformBar = styled.div`
  flex: 1;
  background-color: ${props => 
    props.progress > props.index 
      ? 'var(--primary-color)' 
      : 'var(--audio-player-track)'};
  height: ${props => props.height * 100}%;
  border-radius: 1px;
`;

const SpeedButton = styled.div`
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: ${props => props.isActive ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.isActive ? 'white' : 'var(--text-secondary)'};
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--hover-background)'};
  }
`;

const SpeedControls = styled.div`
  display: flex;
  position: absolute;
  bottom: -24px;
  left: 0;
  width: 100%;
  justify-content: center;
  gap: 8px;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const AudioPlayer = ({ audioUrl, isVoiceMessage = true, showWaveform = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0.3));
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  
  // Generate waveform data when component mounts
  useEffect(() => {
    if (isVoiceMessage && showWaveform) {
      const fetchAudioAndGenerateWaveform = async () => {
        try {
          const response = await fetch(audioUrl);
          const blob = await response.blob();
          const waveform = await generateWaveformData(blob);
          setWaveformData(waveform);
        } catch (error) {
          console.error('Error generating waveform:', error);
        }
      };
      
      fetchAudioAndGenerateWaveform();
    }
  }, [audioUrl, isVoiceMessage, showWaveform]);
  
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
  
  // Update playback speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
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
  
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };
  
  const toggleSpeedControls = () => {
    setShowSpeedControls(!showSpeedControls);
  };
  
  const skipForward = () => {
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
  };
  
  const skipBackward = () => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  };
  
  // Calculate which waveform bars should be highlighted based on progress
  const progressIndex = Math.floor((progress / 100) * waveformData.length);
  
  return (
    <PlayerContainer>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <PlayButton onClick={togglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </PlayButton>
      
      {isVoiceMessage && showWaveform ? (
        <WaveformContainer>
          {waveformData.map((height, index) => (
            <WaveformBar 
              key={index} 
              height={height}
              index={index}
              progress={progressIndex}
            />
          ))}
        </WaveformContainer>
      ) : (
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
      )}
      
      <ControlsContainer>
        <TimeDisplay onClick={toggleSpeedControls}>
          {formatAudioTime(currentTime)}
        </TimeDisplay>
        
        <SpeedControls isVisible={showSpeedControls}>
          <SpeedButton 
            isActive={playbackSpeed === 0.5} 
            onClick={() => handleSpeedChange(0.5)}
          >
            0.5x
          </SpeedButton>
          <SpeedButton 
            isActive={playbackSpeed === 1} 
            onClick={() => handleSpeedChange(1)}
          >
            1x
          </SpeedButton>
          <SpeedButton 
            isActive={playbackSpeed === 1.5} 
            onClick={() => handleSpeedChange(1.5)}
          >
            1.5x
          </SpeedButton>
          <SpeedButton 
            isActive={playbackSpeed === 2} 
            onClick={() => handleSpeedChange(2)}
          >
            2x
          </SpeedButton>
        </SpeedControls>
      </ControlsContainer>
    </PlayerContainer>
  );
};

export default AudioPlayer;

