import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaEllipsisV, 
  FaBell, 
  FaBellSlash, 
  FaSearch,
  FaStar,
  FaTrash,
  FaLock,
  FaBan,
  FaExclamationTriangle,
  FaCamera,
  FaImage,
  FaFile,
  FaLink
} from 'react-icons/fa';
import { getContactById, getChatByContactId } from '../../data/mockData';
import SharedMedia from './SharedMedia';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  height: 60px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    font-size: 19px;
    font-weight: 500;
    margin-left: 24px;
  }
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

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--background-lighter);
`;

const Avatar = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
`;

const Name = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Status = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
`;

const Phone = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: var(--background-lighter);
  margin-bottom: 8px;
`;

const ActionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  svg {
    font-size: 20px;
    color: var(--primary-color);
    margin-bottom: 8px;
  }
`;

const ActionText = styled.div`
  font-size: 13px;
  color: var(--text-primary);
`;

const SettingsSection = styled.div`
  margin-bottom: 8px;
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

const MediaSection = styled.div`
  margin-bottom: 8px;
`;

const MediaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  border-bottom: 1px solid var(--border-color);
`;

const MediaTitle = styled.div`
  color: var(--text-primary);
  font-weight: 500;
`;

const MediaCount = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
`;

const EncryptionNotice = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  margin-bottom: 8px;
  
  svg {
    color: var(--primary-color);
    margin-right: 12px;
  }
`;

const EncryptionText = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
`;

const DangerSection = styled.div`
  margin-bottom: 24px;
`;

const DangerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
  
  svg {
    font-size: 20px;
    color: ${props => props.iconColor || 'var(--danger-color)'};
    margin-right: 16px;
  }
`;

const DangerText = styled.div`
  color: ${props => props.textColor || 'var(--danger-color)'};
`;

const ContactInfo = ({ contactId, onClose }) => {
  const contact = getContactById(contactId);
  const chat = getChatByContactId(contactId);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCustomNotifications, setIsCustomNotifications] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleCustomNotifications = () => {
    setIsCustomNotifications(!isCustomNotifications);
  };
  
  const toggleBlock = () => {
    setIsBlocked(!isBlocked);
  };
  
  if (!contact) return null;
  
  return (
    <InfoContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Contact info</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaSearch />
          </ActionButton>
          <ActionButton>
            <FaEllipsisV />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <ProfileSection>
        <Avatar src={contact.avatar} alt={contact.name} />
        <Name>{contact.name}</Name>
        <Status>{contact.status}</Status>
        {contact.phone && <Phone>{contact.phone}</Phone>}
      </ProfileSection>
      
      <ActionSection>
        <ActionItem>
          <FaCamera />
          <ActionText>Audio</ActionText>
        </ActionItem>
        <ActionItem>
          <FaCamera />
          <ActionText>Video</ActionText>
        </ActionItem>
        <ActionItem>
          <FaSearch />
          <ActionText>Search</ActionText>
        </ActionItem>
      </ActionSection>
      
      <SettingsSection>
        <SettingItem onClick={toggleMute}>
          <SettingInfo>
            {isMuted ? <FaBellSlash /> : <FaBell />}
            <div>
              <SettingText>Mute notifications</SettingText>
              <SettingDescription>
                {isMuted ? 'On' : 'Off'}
              </SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={isMuted} />
        </SettingItem>
        
        <SettingItem onClick={toggleCustomNotifications}>
          <SettingInfo>
            <FaBell />
            <SettingText>Custom notifications</SettingText>
          </SettingInfo>
          <ToggleSwitch isOn={isCustomNotifications} />
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <FaStar />
            <SettingText>Starred messages</SettingText>
          </SettingInfo>
        </SettingItem>
      </SettingsSection>
      
      <MediaSection>
        <MediaHeader>
          <MediaTitle>Media, links, and docs</MediaTitle>
          <MediaCount>20 ›</MediaCount>
        </MediaHeader>
        
        <SharedMedia contactId={contactId} />
      </MediaSection>
      
      <EncryptionNotice>
        <FaLock />
        <EncryptionText>
          Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
        </EncryptionText>
      </EncryptionNotice>
      
      <DangerSection>
        <DangerItem onClick={toggleBlock}>
          <FaBan />
          <DangerText>
            {isBlocked ? 'Unblock' : 'Block'} {contact.name}
          </DangerText>
        </DangerItem>
        
        <DangerItem>
          <FaExclamationTriangle />
          <DangerText>Report {contact.name}</DangerText>
        </DangerItem>
        
        <DangerItem>
          <FaTrash />
          <DangerText>Delete chat</DangerText>
        </DangerItem>
      </DangerSection>
    </InfoContainer>
  );
};

export default ContactInfo;

