import React from 'react';
import styled from 'styled-components';
import { FaUser, FaPhone, FaComment, FaUserPlus } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';

const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 5px;
  width: 280px;
`;

const ContactHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ContactAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-right: 12px;
  overflow: hidden;
`;

const ContactImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: var(--text-primary);
`;

const ContactNumber = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const ContactActions = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
`;

const ActionButton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:not(:last-child) {
    margin-right: 8px;
  }
`;

const ActionIcon = styled.div`
  color: var(--primary-color);
  font-size: 18px;
  margin-bottom: 4px;
`;

const ActionLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ContactMessage = ({ contact }) => {
  const { startChat } = useChat();
  
  // Default values if not provided
  const name = contact.name || 'Contact';
  const phoneNumber = contact.phoneNumber || '+1 234 567 8900';
  const avatar = contact.avatar || null;
  
  const handleMessageClick = () => {
    // In a real app, this would start a chat with the contact
    if (startChat) {
      startChat(contact);
    } else {
      console.log('Start chat with', name);
    }
  };
  
  const handleCallClick = () => {
    // In a real app, this would initiate a call
    console.log('Call', name);
  };
  
  const handleAddClick = () => {
    // In a real app, this would add the contact to the user's contacts
    console.log('Add', name, 'to contacts');
  };
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <ContactContainer>
      <ContactHeader>
        <ContactAvatar>
          {avatar ? (
            <ContactImage src={avatar} alt={name} />
          ) : (
            <FaUser />
          )}
        </ContactAvatar>
        <ContactInfo>
          <ContactName>{name}</ContactName>
          <ContactNumber>{phoneNumber}</ContactNumber>
        </ContactInfo>
      </ContactHeader>
      
      <ContactActions>
        <ActionButton onClick={handleMessageClick}>
          <ActionIcon>
            <FaComment />
          </ActionIcon>
          <ActionLabel>Message</ActionLabel>
        </ActionButton>
        
        <ActionButton onClick={handleCallClick}>
          <ActionIcon>
            <FaPhone />
          </ActionIcon>
          <ActionLabel>Call</ActionLabel>
        </ActionButton>
        
        <ActionButton onClick={handleAddClick}>
          <ActionIcon>
            <FaUserPlus />
          </ActionIcon>
          <ActionLabel>Add</ActionLabel>
        </ActionButton>
      </ContactActions>
    </ContactContainer>
  );
};

export default ContactMessage;

