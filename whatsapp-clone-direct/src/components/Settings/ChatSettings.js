import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArchive, 
  FaDownload, 
  FaFont, 
  FaMoon, 
  FaSun, 
  FaImage,
  FaCheck
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const FontSizeModal = styled.div`
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
  font-size: ${props => props.size || '16px'};
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

const ChatSettings = ({ onBack }) => {
  const { darkMode, toggleTheme } = useTheme();
  const [enterToSend, setEnterToSend] = useState(true);
  const [mediaVisibility, setMediaVisibility] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  
  const handleEnterToSendToggle = () => {
    setEnterToSend(!enterToSend);
  };
  
  const handleMediaVisibilityToggle = () => {
    setMediaVisibility(!mediaVisibility);
  };
  
  const handleFontSizeClick = () => {
    setShowFontSizeModal(true);
  };
  
  const handleFontSizeSelect = (size) => {
    setFontSize(size);
    setShowFontSizeModal(false);
  };
  
  const getFontSizeText = () => {
    switch (fontSize) {
      case 'small':
        return 'Small';
      case 'medium':
        return 'Medium';
      case 'large':
        return 'Large';
      default:
        return 'Medium';
    }
  };
  
  return (
    <SettingsContainer>
      <SettingsSection>
        <SettingItem onClick={toggleTheme}>
          <SettingInfo>
            {darkMode ? <FaSun /> : <FaMoon />}
            <SettingText>{darkMode ? 'Light theme' : 'Dark theme'}</SettingText>
          </SettingInfo>
          <ToggleSwitch isOn={darkMode} />
        </SettingItem>
        
        <SettingItem onClick={() => {}}>
          <SettingInfo>
            <FaImage />
            <SettingText>Wallpaper</SettingText>
          </SettingInfo>
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SettingItem onClick={handleEnterToSendToggle}>
          <SettingInfo>
            <div>
              <SettingText>Enter is send</SettingText>
              <SettingDescription>Enter key will send your message</SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={enterToSend} />
        </SettingItem>
        
        <SettingItem onClick={handleMediaVisibilityToggle}>
          <SettingInfo>
            <div>
              <SettingText>Media visibility</SettingText>
              <SettingDescription>Show newly downloaded media in your phone's gallery</SettingDescription>
            </div>
          </SettingInfo>
          <ToggleSwitch isOn={mediaVisibility} />
        </SettingItem>
        
        <SettingItem onClick={handleFontSizeClick}>
          <SettingInfo>
            <FaFont />
            <SettingText>Font size</SettingText>
          </SettingInfo>
          <OptionValue>
            {getFontSizeText()}
          </OptionValue>
        </SettingItem>
      </SettingsSection>
      
      <SettingsSection>
        <SettingItem>
          <SettingInfo>
            <FaArchive />
            <div>
              <SettingText>Chat backup</SettingText>
              <SettingDescription>Back up your chats to Google Drive</SettingDescription>
            </div>
          </SettingInfo>
        </SettingItem>
        
        <SettingItem>
          <SettingInfo>
            <FaDownload />
            <div>
              <SettingText>Export chat</SettingText>
              <SettingDescription>Export chat history as a text file</SettingDescription>
            </div>
          </SettingInfo>
        </SettingItem>
      </SettingsSection>
      
      <FontSizeModal isOpen={showFontSizeModal}>
        <ModalContent>
          <ModalHeader>Font size</ModalHeader>
          <ModalOptions>
            <ModalOption onClick={() => handleFontSizeSelect('small')}>
              <OptionText size="14px">Small</OptionText>
              {fontSize === 'small' && <FaCheck />}
            </ModalOption>
            <ModalOption onClick={() => handleFontSizeSelect('medium')}>
              <OptionText size="16px">Medium</OptionText>
              {fontSize === 'medium' && <FaCheck />}
            </ModalOption>
            <ModalOption onClick={() => handleFontSizeSelect('large')}>
              <OptionText size="18px">Large</OptionText>
              {fontSize === 'large' && <FaCheck />}
            </ModalOption>
          </ModalOptions>
          <ModalActions>
            <ModalButton onClick={() => setShowFontSizeModal(false)}>Cancel</ModalButton>
          </ModalActions>
        </ModalContent>
      </FontSizeModal>
    </SettingsContainer>
  );
};

export default ChatSettings;

