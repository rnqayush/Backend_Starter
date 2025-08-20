import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPhone, FaVideo, FaPhoneSlash } from 'react-icons/fa';

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

const CallType = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  
  svg {
    margin-right: 8px;
  }
`;

const CallControls = styled.div`
  display: flex;
  justify-content: center;
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

const RingingDots = styled.div`
  display: flex;
  margin-top: 16px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  margin: 0 4px;
  opacity: ${props => props.active ? 1 : 0.3};
  transition: opacity 0.3s ease;
`;

const OutgoingCall = ({ contact, isVideo = false, onCancel, onConnect }) => {
  const [activeDot, setActiveDot] = useState(0);
  const [callStatus, setCallStatus] = useState('calling'); // calling, connecting, connected
  
  // Simulate ringing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot(prev => (prev + 1) % 3);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate call connecting
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Randomly decide if call connects or not
      const connects = Math.random() > 0.3; // 70% chance to connect
      
      if (connects) {
        setCallStatus('connecting');
        setTimeout(() => {
          setCallStatus('connected');
          if (onConnect) onConnect();
        }, 1500);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [onConnect]);
  
  return (
    <CallContainer>
      <CallInfo>
        <Avatar src={contact.avatar} alt={contact.name} />
        <Name>{contact.name}</Name>
        <Status>
          {callStatus === 'calling' ? 'Calling' : 
           callStatus === 'connecting' ? 'Connecting' : 'Connected'}
        </Status>
        {callStatus === 'calling' && (
          <RingingDots>
            <Dot active={activeDot === 0} />
            <Dot active={activeDot === 1} />
            <Dot active={activeDot === 2} />
          </RingingDots>
        )}
        <CallType>
          {isVideo ? <FaVideo /> : <FaPhone />}
          {isVideo ? 'Video Call' : 'Voice Call'}
        </CallType>
      </CallInfo>
      
      <CallControls>
        <ControlButton onClick={onCancel} color="#FF3B30">
          <FaPhoneSlash />
        </ControlButton>
      </CallControls>
    </CallContainer>
  );
};

export default OutgoingCall;

