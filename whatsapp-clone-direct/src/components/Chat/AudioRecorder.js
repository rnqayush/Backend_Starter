import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaMicrophone, FaStop, FaTrash, FaPaperPlane } from 'react-icons/fa';

const RecorderContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--sidebar-header);
  padding: 10px 16px;
  position: relative;
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 10px;
`;

const RecordingTime = styled.div`
  font-size: 15px;
  color: var(--text-primary);
  margin-left: 10px;
`;

const RecordingWaveform = styled.div`
  flex: 1;
  height: 30px;
  background-color: var(--incoming-message);
  border-radius: 15px;
  margin: 0 10px;
  position: relative;
  overflow: hidden;
`;

const WaveformAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    var(--primary-color) 0%,
    var(--secondary-color) 50%,
    var(--primary-color) 100%
  );
  background-size: 200% 100%;
  animation: wave 1.5s linear infinite;
  opacity: 0.7;
  
  @keyframes wave {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

const RecordButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.recording ? 'var(--notification-color)' : 'var(--primary-color)'};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.recording ? '#ff5252' : 'var(--secondary-color)'};
  }
`;

const ActionButton = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  margin: 0 10px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const AudioRecorder = ({ onSendAudio, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    onCancel();
  };
  
  const sendAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      onSendAudio(audioUrl);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <RecorderContainer>
      {isRecording ? (
        <>
          <RecordButton recording={true} onClick={stopRecording}>
            <FaStop />
          </RecordButton>
          
          <RecordingIndicator>
            <RecordingWaveform>
              <WaveformAnimation />
            </RecordingWaveform>
            <RecordingTime>{formatTime(recordingTime)}</RecordingTime>
          </RecordingIndicator>
          
          <ActionButton onClick={cancelRecording}>
            <FaTrash />
          </ActionButton>
        </>
      ) : audioBlob ? (
        <>
          <ActionButton onClick={() => setIsRecording(true)}>
            <FaMicrophone />
          </ActionButton>
          
          <RecordingIndicator>
            <RecordingTime>Audio recorded ({formatTime(recordingTime)})</RecordingTime>
          </RecordingIndicator>
          
          <ActionButton onClick={cancelRecording}>
            <FaTrash />
          </ActionButton>
          
          <ActionButton onClick={sendAudio}>
            <FaPaperPlane />
          </ActionButton>
        </>
      ) : (
        <>
          <RecordButton onClick={startRecording}>
            <FaMicrophone />
          </RecordButton>
          
          <RecordingIndicator>
            <RecordingTime>Tap to start recording</RecordingTime>
          </RecordingIndicator>
          
          <ActionButton onClick={onCancel}>
            <FaTrash />
          </ActionButton>
        </>
      )}
    </RecorderContainer>
  );
};

export default AudioRecorder;

