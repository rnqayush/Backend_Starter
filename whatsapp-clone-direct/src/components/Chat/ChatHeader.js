import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaEllipsisV, FaArrowLeft } from 'react-icons/fa';

const Header = styled.div`
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
  cursor: pointer;
  color: var(--icon-color);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactName = styled.span`
  font-weight: 500;
  font-size: 16px;
  color: var(--text-primary);
`;

const ContactStatus = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 24px;
  color: var(--icon-color);
`;

const IconWrapper = styled.div`
  cursor: pointer;
  font-size: 18px;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const ChatHeader = ({ contact, setIsChatOpen }) => {
  const handleBackClick = () => {
    setIsChatOpen(false);
  };

  return (
    <Header>
      <ContactInfo>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft />
        </BackButton>
        <Avatar src={contact.avatar} alt={contact.name} />
        <ContactDetails>
          <ContactName>{contact.name}</ContactName>
          <ContactStatus>
            {contact.isOnline ? 'online' : contact.lastSeen ? `last seen ${contact.lastSeen}` : contact.status}
          </ContactStatus>
        </ContactDetails>
      </ContactInfo>
      
      <IconsContainer>
        <IconWrapper title="Search">
          <FaSearch />
        </IconWrapper>
        <IconWrapper title="Menu">
          <FaEllipsisV />
        </IconWrapper>
      </IconsContainer>
    </Header>
  );
};

export default ChatHeader;

