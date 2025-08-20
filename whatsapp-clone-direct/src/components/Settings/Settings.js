import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaDatabase, 
  FaQuestionCircle,
  FaUserFriends,
  FaKey,
  FaMoon,
  FaSun,
  FaImage,
  FaChevronRight
} from 'react-icons/fa';
import { currentUser } from '../../data/mockData';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileSettings from './ProfileSettings';
import ChatSettings from './ChatSettings';
import NotificationSettings from './NotificationSettings';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
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

const SettingsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const Status = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const SettingsSection = styled.div`
  margin-top: 8px;
  background-color: var(--background-lighter);
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  color: ${props => props.color || 'var(--icon-color)'};
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  color: var(--text-primary);
`;

const SettingDescription = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 2px;
`;

const ChevronIcon = styled.div`
  color: var(--text-secondary);
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

const Settings = ({ onClose }) => {
  const [activeScreen, setActiveScreen] = useState('main');
  const { darkMode, toggleTheme } = useTheme();
  
  const handleBack = () => {
    if (activeScreen === 'main') {
      onClose();
    } else {
      setActiveScreen('main');
    }
  };
  
  const renderScreen = () => {
    switch (activeScreen) {
      case 'profile':
        return <ProfileSettings onBack={() => setActiveScreen('main')} />;
      case 'chats':
        return <ChatSettings onBack={() => setActiveScreen('main')} />;
      case 'notifications':
        return <NotificationSettings onBack={() => setActiveScreen('main')} />;
      default:
        return renderMainScreen();
    }
  };
  
  const renderMainScreen = () => (
    <>
      <ProfileSection onClick={() => setActiveScreen('profile')}>
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
        <ProfileInfo>
          <Name>{currentUser.name}</Name>
          <Status>{currentUser.status}</Status>
        </ProfileInfo>
        <ChevronIcon>
          <FaChevronRight />
        </ChevronIcon>
      </ProfileSection>
      
      <SettingsSection>
        <SettingItem onClick={() => setActiveScreen('account')}>
          <IconContainer color="#128C7E">
            <FaKey />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Account</SettingTitle>
            <SettingDescription>Privacy, security, change number</SettingDescription>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
        
        <SettingItem onClick={() => setActiveScreen('chats')}>
          <IconContainer color="#25D366">
            <FaUser />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Chats</SettingTitle>
            <SettingDescription>Theme, wallpapers, chat history</SettingDescription>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
        
        <SettingItem onClick={() => setActiveScreen('notifications')}>
          <IconContainer color="#34B7F1">
            <FaBell />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Notifications</SettingTitle>
            <SettingDescription>Message, group & call tones</SettingDescription>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
        
        <SettingItem onClick={() => setActiveScreen('storage')}>
          <IconContainer color="#8E44AD">
            <FaDatabase />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Storage and data</SettingTitle>
            <SettingDescription>Network usage, auto-download</SettingDescription>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SettingItem onClick={toggleTheme}>
          <IconContainer>
            {darkMode ? <FaSun /> : <FaMoon />}
          </IconContainer>
          <SettingInfo>
            <SettingTitle>{darkMode ? 'Light mode' : 'Dark mode'}</SettingTitle>
          </SettingInfo>
          <ToggleSwitch isOn={darkMode} />
        </SettingItem>
        
        <SettingItem onClick={() => setActiveScreen('wallpaper')}>
          <IconContainer>
            <FaImage />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Wallpaper</SettingTitle>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SettingItem onClick={() => setActiveScreen('invite')}>
          <IconContainer color="#4CAF50">
            <FaUserFriends />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Invite a friend</SettingTitle>
          </SettingInfo>
        </SettingItem>
        
        <SettingItem onClick={() => setActiveScreen('help')}>
          <IconContainer color="#FFC107">
            <FaQuestionCircle />
          </IconContainer>
          <SettingInfo>
            <SettingTitle>Help</SettingTitle>
            <SettingDescription>FAQ, contact us, privacy policy</SettingDescription>
          </SettingInfo>
          <ChevronIcon>
            <FaChevronRight />
          </ChevronIcon>
        </SettingItem>
      </SettingsSection>
    </>
  );
  
  return (
    <SettingsContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
          </BackButton>
          <h1>
            {activeScreen === 'main' ? 'Settings' : 
             activeScreen === 'profile' ? 'Profile' :
             activeScreen === 'account' ? 'Account' :
             activeScreen === 'chats' ? 'Chats' :
             activeScreen === 'notifications' ? 'Notifications' :
             activeScreen === 'storage' ? 'Storage and data' :
             activeScreen === 'help' ? 'Help' : 'Settings'}
          </h1>
        </HeaderTitle>
      </Header>
      
      <SettingsList>
        {renderScreen()}
      </SettingsList>
    </SettingsContainer>
  );
};

export default Settings;

