import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaEllipsisV, FaSearch } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import TypingIndicator from './TypingIndicator';
import MessageSearch from './MessageSearch';

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
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ChatHeader = ({ contact, setIsChatOpen }) => {
  const { typingStatus } = useChat();
  const [showSearch, setShowSearch] = useState(false);
  
  const isTyping = typingStatus[contact.id];
  
  const handleBackClick = () => {
    setIsChatOpen(false);
  };
  
  const handleSearchClick = () => {
    setShowSearch(!showSearch);
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
          <IconWrapper title="Menu">
            <FaEllipsisV />
          </IconWrapper>
        </IconsContainer>
      </HeaderContainer>
      
      {showSearch && <MessageSearch onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default ChatHeader;

