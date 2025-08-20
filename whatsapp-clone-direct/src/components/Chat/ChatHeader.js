import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaEllipsisV, FaSearch, FaInfoCircle, FaVideo, FaPhone } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import TypingIndicator from './TypingIndicator';
import MessageSearch from './MessageSearch';
import GroupInfo from './GroupInfo';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
  border-left: 1px solid var(--border-color);
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.div`
  display: none;
  margin-right: 10px;
  color: var(--icon-color);
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
`;

const Status = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const IconsContainer = styled.div`
  display: flex;
  color: var(--icon-color);
`;

const IconWrapper = styled.div`
  margin-left: 22px;
  cursor: pointer;
  font-size: 20px;
  position: relative;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--dropdown-background);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  width: 200px;
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--dropdown-hover);
  }
  
  svg {
    margin-right: 10px;
  }
`;

const ChatHeader = ({ contact, setIsChatOpen }) => {
  const { typingStatus } = useChat();
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  const isTyping = typingStatus[contact.id];
  
  const handleBackClick = () => {
    setIsChatOpen(false);
  };
  
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
    setShowDropdown(false);
  };
  
  const handleMenuClick = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleGroupInfoClick = () => {
    setShowGroupInfo(true);
    setShowDropdown(false);
  };
  
  const handleVideoCallClick = () => {
    // In a real app, this would initiate a video call
    console.log('Video call with', contact.name);
    setShowDropdown(false);
  };
  
  const handleVoiceCallClick = () => {
    // In a real app, this would initiate a voice call
    console.log('Voice call with', contact.name);
    setShowDropdown(false);
  };

  return (
    <>
      <HeaderContainer>
        <ContactInfo>
          <BackButton onClick={handleBackClick}>
            <FaArrowLeft />
          </BackButton>
          <Avatar src={contact.avatar} alt={contact.name} />
          <InfoText>
            <Name>{contact.name}</Name>
            {isTyping ? (
              <TypingIndicator name={contact.isGroup ? null : contact.name.split(' ')[0]} />
            ) : (
              <Status>
                {contact.isGroup 
                  ? contact.status 
                  : contact.isOnline 
                    ? 'online' 
                    : `last seen ${contact.lastSeen}`
                }
              </Status>
            )}
          </InfoText>
        </ContactInfo>
        
        <IconsContainer>
          <IconWrapper title="Search" onClick={handleSearchClick}>
            <FaSearch />
          </IconWrapper>
          <IconWrapper title="Menu" onClick={handleMenuClick}>
            <FaEllipsisV />
            <DropdownMenu isOpen={showDropdown}>
              {contact.isGroup && (
                <MenuItem onClick={handleGroupInfoClick}>
                  <FaInfoCircle />
                  Group info
                </MenuItem>
              )}
              <MenuItem onClick={handleVideoCallClick}>
                <FaVideo />
                Video call
              </MenuItem>
              <MenuItem onClick={handleVoiceCallClick}>
                <FaPhone />
                Voice call
              </MenuItem>
            </DropdownMenu>
          </IconWrapper>
        </IconsContainer>
      </HeaderContainer>
      
      {showSearch && <MessageSearch onClose={() => setShowSearch(false)} />}
      {showGroupInfo && contact.isGroup && (
        <GroupInfo 
          group={contact} 
          onClose={() => setShowGroupInfo(false)} 
        />
      )}
    </>
  );
};

export default ChatHeader;
