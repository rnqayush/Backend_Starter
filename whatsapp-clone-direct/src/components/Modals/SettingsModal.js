import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaUser, FaBell, FaLock, FaPalette, FaInfoCircle, FaCheck } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { currentUser } from '../../data/mockData';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--modal-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: var(--settings-background);
  border-radius: 3px;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 17px 50px 0 rgba(0, 0, 0, 0.19), 0 12px 15px 0 rgba(0, 0, 0, 0.24);
`;

const Sidebar = styled.div`
  width: 30%;
  min-width: 200px;
  background-color: var(--settings-background);
  border-right: 1px solid var(--settings-border);
  overflow-y: auto;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--settings-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 19px;
  font-weight: 500;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const MenuItem = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--text-primary);
  background-color: ${props => props.active ? 'var(--settings-hover)' : 'transparent'};
  
  &:hover {
    background-color: var(--settings-hover);
  }
  
  svg {
    margin-right: 15px;
    color: var(--icon-color);
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--settings-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const SettingDescription = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 15px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Toggle = styled.div`
  width: 40px;
  height: 20px;
  background-color: ${props => props.checked ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
`;

const RadioButton = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? 'var(--primary-color)' : 'var(--text-secondary)'};
  margin-right: 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--primary-color);
    display: ${props => props.checked ? 'block' : 'none'};
  }
`;

const RadioLabel = styled.div`
  font-size: 14px;
  color: var(--text-primary);
`;

const ThemePreview = styled.div`
  display: flex;
  margin-top: 15px;
`;

const ThemeOption = styled.div`
  width: 100px;
  height: 60px;
  border-radius: 5px;
  margin-right: 15px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'transparent'};
`;

const ThemePreviewHeader = styled.div`
  height: 20px;
  background-color: ${props => props.dark ? '#202c33' : '#f0f2f5'};
`;

const ThemePreviewBody = styled.div`
  height: 40px;
  background-color: ${props => props.dark ? '#111b21' : '#ffffff'};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ThemePreviewText = styled.div`
  font-size: 10px;
  color: ${props => props.dark ? '#e9edef' : '#111b21'};
`;

const ThemeCheckmark = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  color: var(--primary-color);
  font-size: 14px;
`;

const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    message: true,
    groups: true,
    sounds: true
  });
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    lastSeen: 'everyone',
    profilePhoto: 'everyone'
  });
  const { darkMode, toggleTheme } = useTheme();

  const handleToggle = (setting, value) => {
    switch (setting) {
      case 'notifications':
        setNotifications(prev => ({
          ...prev,
          ...value
        }));
        break;
      case 'privacy':
        setPrivacy(prev => ({
          ...prev,
          ...value
        }));
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <SectionTitle>Profile Settings</SectionTitle>
            <SettingItem>
              <SettingLabel>Profile Photo</SettingLabel>
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '10px' }}
              />
              <button style={{ padding: '8px 12px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                Change Photo
              </button>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Your Name</SettingLabel>
              <input 
                type="text" 
                defaultValue={currentUser.name}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '3px',
                  backgroundColor: 'var(--incoming-message)',
                  color: 'var(--text-primary)'
                }}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>About</SettingLabel>
              <input 
                type="text" 
                defaultValue={currentUser.status}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '3px',
                  backgroundColor: 'var(--incoming-message)',
                  color: 'var(--text-primary)'
                }}
              />
            </SettingItem>
          </>
        );
      case 'notifications':
        return (
          <>
            <SectionTitle>Notification Settings</SectionTitle>
            <SettingItem>
              <SettingLabel>Message Notifications</SettingLabel>
              <SettingDescription>Show notifications for new messages</SettingDescription>
              <ToggleContainer>
                <span>Enable</span>
                <Toggle 
                  checked={notifications.message} 
                  onClick={() => handleToggle('notifications', { message: !notifications.message })}
                />
              </ToggleContainer>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Group Notifications</SettingLabel>
              <SettingDescription>Show notifications for group messages</SettingDescription>
              <ToggleContainer>
                <span>Enable</span>
                <Toggle 
                  checked={notifications.groups} 
                  onClick={() => handleToggle('notifications', { groups: !notifications.groups })}
                />
              </ToggleContainer>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Notification Sounds</SettingLabel>
              <SettingDescription>Play sounds for new notifications</SettingDescription>
              <ToggleContainer>
                <span>Enable</span>
                <Toggle 
                  checked={notifications.sounds} 
                  onClick={() => handleToggle('notifications', { sounds: !notifications.sounds })}
                />
              </ToggleContainer>
            </SettingItem>
          </>
        );
      case 'privacy':
        return (
          <>
            <SectionTitle>Privacy Settings</SectionTitle>
            <SettingItem>
              <SettingLabel>Read Receipts</SettingLabel>
              <SettingDescription>If turned off, you won't send or receive read receipts</SettingDescription>
              <ToggleContainer>
                <span>Enable</span>
                <Toggle 
                  checked={privacy.readReceipts} 
                  onClick={() => handleToggle('privacy', { readReceipts: !privacy.readReceipts })}
                />
              </ToggleContainer>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Last Seen</SettingLabel>
              <SettingDescription>Who can see when you were last online</SettingDescription>
              <RadioGroup>
                <RadioOption onClick={() => handleToggle('privacy', { lastSeen: 'everyone' })}>
                  <RadioButton checked={privacy.lastSeen === 'everyone'} />
                  <RadioLabel>Everyone</RadioLabel>
                </RadioOption>
                <RadioOption onClick={() => handleToggle('privacy', { lastSeen: 'contacts' })}>
                  <RadioButton checked={privacy.lastSeen === 'contacts'} />
                  <RadioLabel>My Contacts</RadioLabel>
                </RadioOption>
                <RadioOption onClick={() => handleToggle('privacy', { lastSeen: 'nobody' })}>
                  <RadioButton checked={privacy.lastSeen === 'nobody'} />
                  <RadioLabel>Nobody</RadioLabel>
                </RadioOption>
              </RadioGroup>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Profile Photo</SettingLabel>
              <SettingDescription>Who can see your profile photo</SettingDescription>
              <RadioGroup>
                <RadioOption onClick={() => handleToggle('privacy', { profilePhoto: 'everyone' })}>
                  <RadioButton checked={privacy.profilePhoto === 'everyone'} />
                  <RadioLabel>Everyone</RadioLabel>
                </RadioOption>
                <RadioOption onClick={() => handleToggle('privacy', { profilePhoto: 'contacts' })}>
                  <RadioButton checked={privacy.profilePhoto === 'contacts'} />
                  <RadioLabel>My Contacts</RadioLabel>
                </RadioOption>
                <RadioOption onClick={() => handleToggle('privacy', { profilePhoto: 'nobody' })}>
                  <RadioButton checked={privacy.profilePhoto === 'nobody'} />
                  <RadioLabel>Nobody</RadioLabel>
                </RadioOption>
              </RadioGroup>
            </SettingItem>
          </>
        );
      case 'theme':
        return (
          <>
            <SectionTitle>Theme Settings</SectionTitle>
            <SettingItem>
              <SettingLabel>Theme</SettingLabel>
              <SettingDescription>Choose between light and dark theme</SettingDescription>
              <ThemePreview>
                <ThemeOption 
                  selected={!darkMode} 
                  onClick={darkMode ? toggleTheme : undefined}
                >
                  <ThemePreviewHeader dark={false} />
                  <ThemePreviewBody dark={false}>
                    <ThemePreviewText dark={false}>Light</ThemePreviewText>
                  </ThemePreviewBody>
                  {!darkMode && (
                    <ThemeCheckmark>
                      <FaCheck />
                    </ThemeCheckmark>
                  )}
                </ThemeOption>
                <ThemeOption 
                  selected={darkMode} 
                  onClick={!darkMode ? toggleTheme : undefined}
                >
                  <ThemePreviewHeader dark={true} />
                  <ThemePreviewBody dark={true}>
                    <ThemePreviewText dark={true}>Dark</ThemePreviewText>
                  </ThemePreviewBody>
                  {darkMode && (
                    <ThemeCheckmark>
                      <FaCheck />
                    </ThemeCheckmark>
                  )}
                </ThemeOption>
              </ThemePreview>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Chat Wallpaper</SettingLabel>
              <SettingDescription>Choose a background for your chats</SettingDescription>
              <button style={{ padding: '8px 12px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                Change Wallpaper
              </button>
            </SettingItem>
          </>
        );
      case 'about':
        return (
          <>
            <SectionTitle>About</SectionTitle>
            <SettingItem>
              <SettingLabel>WhatsApp Clone</SettingLabel>
              <SettingDescription>Version 1.0.0</SettingDescription>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '10px' }}>
                This is a WhatsApp clone built with React and styled-components.
                It's a demonstration project showcasing UI implementation and
                interaction patterns similar to the original WhatsApp Web application.
              </p>
            </SettingItem>
            <SettingItem>
              <SettingLabel>Technologies Used</SettingLabel>
              <ul style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '10px', paddingLeft: '20px' }}>
                <li>React</li>
                <li>Styled Components</li>
                <li>React Icons</li>
                <li>Emoji Picker React</li>
              </ul>
            </SettingItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Sidebar>
          <Header>
            <Title>Settings</Title>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </Header>
          <MenuItem 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          >
            <FaUser />
            Profile
          </MenuItem>
          <MenuItem 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell />
            Notifications
          </MenuItem>
          <MenuItem 
            active={activeTab === 'privacy'} 
            onClick={() => setActiveTab('privacy')}
          >
            <FaLock />
            Privacy
          </MenuItem>
          <MenuItem 
            active={activeTab === 'theme'} 
            onClick={() => setActiveTab('theme')}
          >
            <FaPalette />
            Theme
          </MenuItem>
          <MenuItem 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
          >
            <FaInfoCircle />
            About
          </MenuItem>
        </Sidebar>
        <Content>
          {renderContent()}
        </Content>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default SettingsModal;

