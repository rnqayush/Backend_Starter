import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaUserFriends, FaUserAlt, FaUserSlash } from 'react-icons/fa';

const SettingsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--background);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  height: 60px;
`;

const BackButton = styled.div`
  cursor: pointer;
  font-size: 18px;
  margin-right: 24px;
`;

const HeaderTitle = styled.h1`
  font-size: 19px;
  font-weight: 500;
`;

const SettingsContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SettingsDescription = styled.div`
  padding: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const OptionsList = styled.div`
  background-color: var(--background-lighter);
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const OptionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const OptionInfo = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const OptionDescription = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
`;

const CheckIcon = styled.div`
  color: var(--primary-color);
  font-size: 20px;
  visibility: ${props => props.isSelected ? 'visible' : 'hidden'};
`;

const StatusPrivacySettings = ({ onClose, currentPrivacy = 'my_contacts', onPrivacyChange }) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState(currentPrivacy);
  
  const handlePrivacySelect = (privacy) => {
    setSelectedPrivacy(privacy);
    if (onPrivacyChange) {
      onPrivacyChange(privacy);
    }
  };
  
  return (
    <SettingsContainer>
      <Header>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>Status privacy</HeaderTitle>
      </Header>
      
      <SettingsContent>
        <SettingsDescription>
          Choose who can see your status updates. Updates to your privacy settings won't affect status updates that you've already sent.
        </SettingsDescription>
        
        <OptionsList>
          <OptionItem onClick={() => handlePrivacySelect('my_contacts')}>
            <OptionIcon color="#128C7E">
              <FaUserFriends />
            </OptionIcon>
            <OptionInfo>
              <OptionTitle>My contacts</OptionTitle>
              <OptionDescription>
                Only contacts saved in your phone can see your status updates
              </OptionDescription>
            </OptionInfo>
            <CheckIcon isSelected={selectedPrivacy === 'my_contacts'}>
              <FaCheck />
            </CheckIcon>
          </OptionItem>
          
          <OptionItem onClick={() => handlePrivacySelect('contacts_except')}>
            <OptionIcon color="#FF9800">
              <FaUserSlash />
            </OptionIcon>
            <OptionInfo>
              <OptionTitle>My contacts except...</OptionTitle>
              <OptionDescription>
                Only share with selected contacts
              </OptionDescription>
            </OptionInfo>
            <CheckIcon isSelected={selectedPrivacy === 'contacts_except'}>
              <FaCheck />
            </CheckIcon>
          </OptionItem>
          
          <OptionItem onClick={() => handlePrivacySelect('only_share')}>
            <OptionIcon color="#2196F3">
              <FaUserAlt />
            </OptionIcon>
            <OptionInfo>
              <OptionTitle>Only share with...</OptionTitle>
              <OptionDescription>
                Only share with selected contacts
              </OptionDescription>
            </OptionInfo>
            <CheckIcon isSelected={selectedPrivacy === 'only_share'}>
              <FaCheck />
            </CheckIcon>
          </OptionItem>
        </OptionsList>
      </SettingsContent>
    </SettingsContainer>
  );
};

export default StatusPrivacySettings;

