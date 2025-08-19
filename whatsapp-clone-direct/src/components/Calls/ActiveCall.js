import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPhone, 
  FaVolumeUp, 
  FaVolumeMute,
  FaCommentAlt
} from 'react-icons/fa';

const CallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #111;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const VideoArea = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #222;
`;

const RemoteVideo = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-image: url(${props => props.avatar});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LocalVideo = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 120px;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #444;
  background-image: url(${props => props.avatar});
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const CallInfo = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CallStatus = styled.div`
  color: white;
  font-size: 18px;
  margin-bottom: 5px;
`;

const CallTimer = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const ContactName = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
`;

const CallControls = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ControlButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.danger ? '#FF5252' : props.active ? '#128C7E' : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.danger ? '#FF1744' : props.active ? '#0D7268' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const ActiveCall = ({ contact, type = 'video', onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };
  
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };
  
  return (
    <CallContainer>
      <VideoArea>
        {type === 'video' && !isVideoOff ? (
          <>
            <RemoteVideo avatar={contact.avatar}>
              {/* In a real app, this would be a video element */}
            </RemoteVideo>
            <LocalVideo avatar="https://randomuser.me/api/portraits/men/1.jpg">
              {/* In a real app, this would be a video element */}
            </LocalVideo>
          </>
        ) : (
          <RemoteVideo avatar={contact.avatar}>
            <CallInfo>
              <ContactName>{contact.name}</ContactName>
              <CallStatus>On call</CallStatus>
              <CallTimer>{formatDuration(callDuration)}</CallTimer>
            </CallInfo>
          </RemoteVideo>
        )}
      </VideoArea>
      
      <CallControls>
        <ControlButton 
          active={isSpeakerOn} 
          onClick={toggleSpeaker}
        >
          {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
        </ControlButton>
        
        <ControlButton 
          active={isVideoOff} 
          onClick={toggleVideo}
        >
          {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
        </ControlButton>
        
        <ControlButton 
          active={isMuted} 
          onClick={toggleMute}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </ControlButton>
        
        <ControlButton>
          <FaCommentAlt />
        </ControlButton>
        
        <ControlButton 
          danger 
          onClick={onEndCall}
        >
          <FaPhone style={{ transform: 'rotate(135deg)' }} />
        </ControlButton>
      </CallControls>
    </CallContainer>
  );
};

export default ActiveCall;

