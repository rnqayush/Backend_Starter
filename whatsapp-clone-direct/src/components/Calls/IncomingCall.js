import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPhone, FaPhoneSlash, FaVideo } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
`;

const CallNotificationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--sidebar-header);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 15px;
  animation: ${slideIn} 0.3s ease-out;
`;

const CallAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const CallInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CallType = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

const CallerName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
`;

const CallActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.accept ? 'var(--success-color)' : 'var(--error-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const IncomingCall = ({ contact, type = 'audio', onAccept, onDecline }) => {
  return (
    <CallNotificationContainer>
      <CallAvatar src={contact.avatar} alt={contact.name} />
      <CallInfo>
        <CallType>
          {type === 'video' ? 'Video Call' : 'Voice Call'} from
        </CallType>
        <CallerName>{contact.name}</CallerName>
      </CallInfo>
      <CallActions>
        <ActionButton accept onClick={onAccept}>
          {type === 'video' ? <FaVideo /> : <FaPhone />}
        </ActionButton>
        <ActionButton onClick={onDecline}>
          <FaPhoneSlash />
        </ActionButton>
      </CallActions>
    </CallNotificationContainer>
  );
};

export default IncomingCall;

