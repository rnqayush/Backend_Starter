import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaBell, 
  FaVolumeUp, 
  FaVolumeOff, 
  FaCircle, 
  FaCheck,
  FaLightbulb
} from 'react-icons/fa';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SettingsSection = styled.div`
  margin-bottom: 8px;
`;

const SectionTitle = styled.div`
  padding: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  background-color: var(--background);
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const SettingInfo = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    font-size: 20px;
    color: ${props => props.iconColor || 'var(--icon-color)'};
    margin-right: 16px;
  }
`;

const SettingText = styled.div`
  color: var(--text-primary);
`;

const SettingDescription = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
`;

const ToggleSwitch = styled.div`
  width: 40px;
  height: 20px;
  background-color: ${props => props.isOn ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.2s ease;
  
  &:after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.isOn ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const OptionValue = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 8px;
  }
`;

const ToneModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 90%;
  max-width: 400px;
  background-color: var(--background-lighter);
  border-radius: 8px;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
`;

const ModalOptions = styled.div`
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
`;

const ModalOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  svg {
    color: var(--primary-color);
  }
`;

const OptionText = styled.div`
  color: var(--text-primary);
`;

const PlayButton = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  svg {
    color: var(--text-primary);
    font-size: 14px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--border-color);
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-color-dark)' : 'var(--hover-background)'};
  }
`;

const NotificationSettings = ({ onBack }) => {
  const [conversationTones, setConversationTones] = useState(true);
  const [messageSound, setMessageSound] = useState('Default');
  const [groupSound, setGroupSound] = useState('Default');
  const [callSound, setCallSound] = useState('Default');
  const [showLightNotifications, setShowLightNotifications] = useState(true);
  const [useHighPriority, setUseHighPriority] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  
  const [modalType, setModalType] = useState(null); // null, 'message', 'group', 'call'
  
  const toneOptions = [
    'Default',
    'Alert',
    'Bell',
    'Chime',
    'Classic',
    'Cosmic',
    'Crystal',
    'Digital',
    'Elixir',
    'Essence',
    'Guitar',
    'Note',
    'Pulse',
    'Synth',
    'Wood'
  ];
  
  const handleConversationTonesToggle = () => {
    setConversationTones(!conversationTones);
  };
  
  const handleShowLightNotificationsToggle = () => {
    setShowLightNotifications(!showLightNotifications);
  };
  
  const handleUseHighPriorityToggle = () => {
    setUseHighPriority(!useHighPriority);
  };
  
  const handleShowPreviewToggle = () => {
    setShowPreview(!showPreview);
  };
  
  const handleShowNotificationToggle = () => {
    setShowNotification(!showNotification);
  };
  
  const openToneModal = (type) => {
    setModalType(type);
  };
  
  const handleToneSelect = (tone) => {
    switch (modalType) {
      case 'message':
        setMessageSound(tone);
        break;
      case 'group':
        setGroupSound(tone);
        break;
      case 'call':
        setCallSound(tone);
        break;
      default:
        break;
    }
    setModalType(null);
  };
  
  const playTone = (tone) => {
    // In a real app, this would play the actual tone
    console.log(`Playing ${tone} tone`);
  };
  
  return (
    <SettingsContainer>
      <SettingsSection>
        <SectionTitle>Message notifications</SectionTitle>
        
        <SettingItem onClick={handleShowNotificationToggle}>
          <SettingInfo>
            <SettingText>Notification tone</SettingText>
          </SettingInfo>
          <ToggleSwitch isOn={showNotification} />
        </SettingItem>
        
        {showNotification && (
          <>
            <SettingItem onClick={() => openToneModal('message')}>
              <SettingInfo>
                <SettingText>Tone</SettingText>
              </SettingInfo>
              <OptionValue>
                {messageSound}
              </OptionValue>
            </SettingItem>
            
            <SettingItem onClick={handleShowPreviewToggle}>
              <SettingInfo>
                <SettingText>Message preview</SettingText>
                <SettingDescription>Show message preview in notifications</SettingDescription>
              </SettingInfo>
              <ToggleSwitch isOn={showPreview} />
            </SettingItem>
          </>
        )}
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>Group notifications</SectionTitle>
        
        <SettingItem onClick={() => openToneModal('group')}>
          <SettingInfo>
            <SettingText>Tone</SettingText>
          </SettingInfo>
          <OptionValue>
            {groupSound}
          </OptionValue>
        </SettingItem>
        
        <SettingItem onClick={handleShowPreviewToggle}>
          <SettingInfo>
            <SettingText>Message preview</SettingText>
            <SettingDescription>Show message preview in notifications</SettingDescription>
          </SettingInfo>
          <ToggleSwitch isOn={showPreview} />
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>Call notifications</SectionTitle>
        
        <SettingItem onClick={() => openToneModal('call')}>
          <SettingInfo>
            <SettingText>Ringtone</SettingText>
          </SettingInfo>
          <OptionValue>
            {callSound}
          </OptionValue>
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SectionTitle>Other notifications</SectionTitle>
        
        <SettingItem onClick={handleConversationTonesToggle}>
          <SettingInfo>
            <FaVolumeUp />
            <div>
              <SettingText>Conversation tones</SettingText>
              <SettingDescription>Play sounds for outgoing and incoming messages</SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={conversationTones} />
        </SettingItem>
        
        <SettingItem onClick={handleShowLightNotificationsToggle}>
          <SettingInfo>
            <FaLightbulb />
            <div>
              <SettingText>Light notifications</SettingText>
              <SettingDescription>Flash lights when notifications arrive</SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={showLightNotifications} />
        </SettingItem>
        
        <SettingItem onClick={handleUseHighPriorityToggle}>
          <SettingInfo>
            <FaBell />
            <div>
              <SettingText>Use high priority notifications</SettingText>
              <SettingDescription>Show previews of notifications at the top of the screen</SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={useHighPriority} />
        </SettingItem>
      </SettingsSection>
      
      <ToneModal isOpen={modalType !== null}>
        <ModalContent>
          <ModalHeader>
            {modalType === 'message' ? 'Message tone' : 
             modalType === 'group' ? 'Group tone' : 
             modalType === 'call' ? 'Ringtone' : 'Select tone'}
          </ModalHeader>
          <ModalOptions>
            {toneOptions.map(tone => (
              <ModalOption key={tone} onClick={() => handleToneSelect(tone)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PlayButton onClick={(e) => { e.stopPropagation(); playTone(tone); }}>
                    <FaVolumeUp />
                  </PlayButton>
                  <OptionText>{tone}</OptionText>
                </div>
                {((modalType === 'message' && messageSound === tone) ||
                  (modalType === 'group' && groupSound === tone) ||
                  (modalType === 'call' && callSound === tone)) && <FaCheck />}
              </ModalOption>
            ))}
          </ModalOptions>
          <ModalActions>
            <ModalButton onClick={() => setModalType(null)}>Cancel</ModalButton>
          </ModalActions>
        </ModalContent>
      </ToneModal>
    </SettingsContainer>
  );
};

export default NotificationSettings;

