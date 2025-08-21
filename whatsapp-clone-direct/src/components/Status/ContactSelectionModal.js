import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaSearch } from 'react-icons/fa';
import { contacts, currentUser } from '../../data/mockData';

const ModalContainer = styled.div`
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

const SearchContainer = styled.div`
  padding: 8px 16px;
  background-color: var(--background-lighter);
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background-color: var(--search-input-background);
  border-radius: 20px;
  padding: 8px 16px 8px 40px;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 28px;
  color: var(--text-secondary);
  font-size: 14px;
`;

const ContactsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const ContactStatus = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const CheckboxContainer = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.isSelected ? 'var(--primary-color)' : 'var(--border-color)'};
  background-color: ${props => props.isSelected ? 'var(--primary-color)' : 'transparent'};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
`;

const Footer = styled.div`
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
`;

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

/**
 * Modal for selecting contacts for status privacy settings
 */
const ContactSelectionModal = ({ 
  title = "Select contacts", 
  selectedContacts = [], 
  onSave, 
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(new Set(selectedContacts));
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    // Exclude current user
    if (contact.id === currentUser.id) return false;
    
    // Filter by name if search query exists
    if (searchQuery) {
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
  const toggleContact = (contactId) => {
    const newSelected = new Set(selected);
    
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    
    setSelected(newSelected);
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(Array.from(selected));
    }
  };
  
  return (
    <ModalContainer>
      <Header>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>{title}</HeaderTitle>
      </Header>
      
      <SearchContainer>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search contacts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>
      
      <ContactsList>
        {filteredContacts.map(contact => (
          <ContactItem 
            key={contact.id}
            onClick={() => toggleContact(contact.id)}
          >
            <Avatar src={contact.avatar} alt={contact.name} />
            <ContactInfo>
              <ContactName>{contact.name}</ContactName>
              <ContactStatus>{contact.status}</ContactStatus>
            </ContactInfo>
            <CheckboxContainer isSelected={selected.has(contact.id)}>
              {selected.has(contact.id) && <FaCheck />}
            </CheckboxContainer>
          </ContactItem>
        ))}
      </ContactsList>
      
      <Footer>
        <SaveButton 
          onClick={handleSave}
          disabled={selected.size === 0}
        >
          Save
        </SaveButton>
      </Footer>
    </ModalContainer>
  );
};

export default ContactSelectionModal;

