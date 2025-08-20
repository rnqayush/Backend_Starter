import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaMicrophone, FaTrash, FaPaperPlane, FaPause, FaPlay } from 'react-icons/fa';
import { AudioRecorder, formatAudioTime, generateWaveformData } from '../../utils/audioRecorder';

const RecorderContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-lighter);
  border-radius: 24px;
  padding: 8px 12px;
  width: 100%;
  position: relative;
`;

const RecordButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.isRecording ? 'var(--danger-color)' : 'var(--primary-color)'};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const RecordingInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 12px;
`;

const RecordingTime = styled.div`
  color: ${props => props.isRecording ? 'var(--danger-color)' : 'var(--text-primary)'};
  font-weight: 500;
  font-size: 14px;
`;

const RecordingStatus = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
`;

const WaveformContainer = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  width: 100%;
  gap: 2px;
`;

const WaveformBar = styled.div`
  flex: 1;
  background-color: ${props => props.isRecording ? 'var(--danger-color)' : 'var(--primary-color)'};
  height: ${props => props.height * 100}%;
  border-radius: 1px;
  transition: height 0.1s ease;
`;

const ActionButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: ${props => props.color || 'var(--text-primary)'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const SlideToCancel = styled.div`
  position: absolute;
  left: 0;
  bottom: -24px;
  width: 100%;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [waveformData, setWaveformData] = useState(Array(20).fill(0.1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSlideToCancel, setShowSlideToCancel] = useState(false);
  
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const touchStartXRef = useRef(null);
  
  // Initialize the audio recorder
  useEffect(() => {
    const initRecorder = async () => {
      recorderRef.current = new AudioRecorder();
      const initialized = await recorderRef.current.init();
      
      if (initialized) {
        recorderRef.current.onStop = async (data) => {
          setAudioUrl(data.url);
          setIsRecording(false);
          
          // Generate waveform data from the recorded audio
          const waveform = await generateWaveformData(data.blob);
          setWaveformData(waveform);
        };
        
        recorderRef.current.onDataAvailable = () => {
          // Update waveform data during recording
          const randomHeight = Math.random() * 0.5 + 0.3; // Random height between 0.3 and 0.8
          setWaveformData(prev => [...prev.slice(1), randomHeight]);
        };
      }
    };
    
    initRecorder();
    
    return () => {
      if (recorderRef.current) {
        recorderRef.current.dispose();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [audioUrl]);
  
  const startRecording = async () => {
    if (recorderRef.current) {
      const started = recorderRef.current.start();
      if (started) {
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        setAudioUrl(null);
        setWaveformData(Array(20).fill(0.1));
        setShowSlideToCancel(true);
      }
    }
  };
  
  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setShowSlideToCancel(false);
    }
  };
  
  const pauseRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.pause();
      setIsPaused(true);
    }
  };
  
  const resumeRecording = () => {
    if (recorderRef.current && isRecording && isPaused) {
      recorderRef.current.resume();
      setIsPaused(false);
    }
  };
  
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleSend = () => {
    if (audioUrl && onSend) {
      onSend({
        url: audioUrl,
        duration: recordingTime
      });
    }
  };
  
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setAudioUrl(null);
    setRecordingTime(0);
    setWaveformData(Array(20).fill(0.1));
    
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    if (!touchStartXRef.current || !isRecording) return;
    
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    
    // If swiped left more than 100px, cancel recording
    if (diff > 100) {
      handleCancel();
    }
  };
  
  const handleTouchEnd = () => {
    touchStartXRef.current = null;
  };
  
  return (
    <RecorderContainer
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}
      
      {!isRecording && !audioUrl ? (
        // Initial state - ready to record
        <RecordButton onClick={startRecording}>
          <FaMicrophone />
        </RecordButton>
      ) : isRecording ? (
        // Recording state
        <RecordButton 
          isRecording={isRecording} 
          onClick={isPaused ? resumeRecording : pauseRecording}
        >
          {isPaused ? <FaMicrophone /> : <FaPause />}
        </RecordButton>
      ) : (
        // Recorded state - ready to send
        <ActionButton onClick={togglePlayback} color="var(--primary-color)">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </ActionButton>
      )}
      
      <RecordingInfo>
        <RecordingTime isRecording={isRecording && !isPaused}>
          {formatAudioTime(recordingTime)}
        </RecordingTime>
        <WaveformContainer>
          {waveformData.map((height, index) => (
            <WaveformBar 
              key={index} 
              height={height} 
              isRecording={isRecording && !isPaused}
            />
          ))}
        </WaveformContainer>
      </RecordingInfo>
      
      {isRecording ? (
        // Stop button while recording
        <ActionButton onClick={stopRecording} color="var(--primary-color)">
          <FaPaperPlane />
        </ActionButton>
      ) : audioUrl ? (
        // Send and cancel buttons after recording
        <>
          <ActionButton onClick={handleCancel} color="var(--danger-color)">
            <FaTrash />
          </ActionButton>
          <ActionButton onClick={handleSend} color="var(--primary-color)">
            <FaPaperPlane />
          </ActionButton>
        </>
      ) : null}
      
      <SlideToCancel isVisible={showSlideToCancel}>
        Slide to cancel
      </SlideToCancel>
    </RecorderContainer>
  );
};

export default VoiceRecorder;

