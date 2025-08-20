import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaVolumeUp, 
  FaPhone, 
  FaArrowLeft,
  FaEllipsisV
} from 'react-icons/fa';

const CallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--primary-color-dark);
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  color: white;
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

const CallInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: white;
  flex: 1;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 24px;
  object-fit: cover;
  border: 2px solid white;
`;

const Name = styled.div`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Status = styled.div`
  font-size: 16px;
  opacity: 0.8;
`;

const Timer = styled.div`
  font-size: 14px;
  margin-top: 16px;
  opacity: 0.7;
`;

const CallControls = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 24px;
`;

const ControlButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.color || 'rgba(255, 255, 255, 0.2)'};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 24px;
  
  &:hover {
    background-color: ${props => props.color ? props.color : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const VideoContainer = styled.div`
  position: relative;
  flex: 1;
  background-color: #000;
  overflow: hidden;
`;

const RemoteVideo = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
`;

const LocalVideo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 100px;
  height: 150px;
  background-color: #444;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const CallScreen = ({ contact, isVideo = false, onClose }) => {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ongoing, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const [callDuration, setCallDuration] = useState(0);
  
  useEffect(() => {
    // Simulate call connecting
    const connectTimeout = setTimeout(() => {
      setCallStatus('ongoing');
    }, 2000);
    
    return () => clearTimeout(connectTimeout);
  }, []);
  
  // Call timer
  useEffect(() => {
    let timer;
    if (callStatus === 'ongoing') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);
  
  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      if (onClose) onClose();
    }, 1000);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <CallContainer>
      {isVideoEnabled ? (
        <>
          <VideoContainer>
            <RemoteVideo>
              {callStatus === 'connecting' ? 'Connecting...' : 'Remote Video'}
            </RemoteVideo>
            <LocalVideo>
              Local Video
            </LocalVideo>
          </VideoContainer>
          
          <Header>
            <BackButton onClick={handleEndCall}>
              <FaArrowLeft />
            </BackButton>
            <HeaderActions>
              <ActionButton>
                <FaEllipsisV />
              </ActionButton>
            </HeaderActions>
          </Header>
        </>
      ) : (
        <>
          <Header>
            <BackButton onClick={handleEndCall}>
              <FaArrowLeft />
            </BackButton>
            <HeaderActions>
              <ActionButton>
                <FaEllipsisV />
              </ActionButton>
            </HeaderActions>
          </Header>
          
          <CallInfo>
            <Avatar src={contact.avatar} alt={contact.name} />
            <Name>{contact.name}</Name>
            <Status>
              {callStatus === 'connecting' ? 'Connecting...' : 
               callStatus === 'ongoing' ? 'On call' : 'Call ended'}
            </Status>
            {callStatus === 'ongoing' && (
              <Timer>{formatDuration(callDuration)}</Timer>
            )}
          </CallInfo>
        </>
      )}
      
      <CallControls>
        <ControlButton onClick={toggleSpeaker} color={isSpeaker ? '#25D366' : undefined}>
          <FaVolumeUp />
        </ControlButton>
        <ControlButton onClick={toggleVideo} color={isVideoEnabled ? '#25D366' : undefined}>
          {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </ControlButton>
        <ControlButton onClick={toggleMute} color={isMuted ? '#25D366' : undefined}>
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </ControlButton>
        <ControlButton onClick={handleEndCall} color="#FF3B30">
          <FaPhone style={{ transform: 'rotate(135deg)' }} />
        </ControlButton>
      </CallControls>
    </CallContainer>
  );
};

export default CallScreen;

