import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCamera, FaCheck, FaSearch } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { contacts } from '../../data/mockData';

const CreateGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 30%;
  min-width: 300px;
  max-width: 450px;
  height: 100%;
  background-color: var(--sidebar-background);
  border-right: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex: 100%;
    max-width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
`;

const BackButton = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  padding: 15px 0;
  background-color: var(--sidebar-header);
`;

const Step = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  margin: 0 5px;
`;

const GroupInfoSection = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GroupAvatar = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: var(--search-background);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const CameraIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
  position: ${props => props.absolute ? 'absolute' : 'static'};
  bottom: ${props => props.absolute ? '10px' : 'auto'};
  right: ${props => props.absolute ? '10px' : 'auto'};
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const GroupNameInput = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 2px solid var(--primary-color);
  background-color: transparent;
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 20px;
  outline: none;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--search-background);
  border-bottom: 1px solid var(--border-color);
`;

const SearchIcon = styled.div`
  color: var(--icon-color);
  margin-right: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  
  &::placeholder {
    color: var(--text-secondary);
  }
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
  background-color: ${props => props.selected ? 'var(--hover-background)' : 'transparent'};
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const ContactAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const ContactStatus = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const CheckboxContainer = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.selected ? 'var(--primary-color)' : 'transparent'};
  color: white;
  transition: all 0.2s;
`;

const SelectedContactsBar = styled.div`
  display: flex;
  padding: 10px;
  background-color: var(--sidebar-header);
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
`;

const SelectedContact = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 15px;
  position: relative;
`;

const SelectedAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 5px;
`;

const SelectedName = styled.div`
  font-size: 12px;
  color: var(--text-primary);
  max-width: 60px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--error-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
`;

const NextButton = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const CreateGroup = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const { createGroup } = useChat();
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleContactSelect = (contact) => {
    if (selectedContacts.some(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };
  
  const handleRemoveContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
  };
  
  const handleNextStep = () => {
    if (step === 1 && selectedContacts.length > 0) {
      setStep(2);
    } else if (step === 2 && groupName.trim()) {
      // Create the group
      const memberIds = selectedContacts.map(c => c.id);
      const newGroup = createGroup(groupName, memberIds, groupAvatar);
      onClose();
    }
  };
  
  const handleAvatarUpload = () => {
    // In a real app, this would open a file picker
    // For now, we'll just set a random avatar
    const randomAvatar = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
    setGroupAvatar(randomAvatar);
  };
  
  return (
    <CreateGroupContainer>
      <Header>
        <BackButton onClick={step === 1 ? onClose : () => setStep(1)}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>
          {step === 1 ? 'Add group participants' : 'New group'}
        </HeaderTitle>
      </Header>
      
      <StepIndicator>
        <Step active={step >= 1} />
        <Step active={step >= 2} />
      </StepIndicator>
      
      {step === 1 ? (
        <>
          {selectedContacts.length > 0 && (
            <SelectedContactsBar>
              {selectedContacts.map(contact => (
                <SelectedContact key={contact.id}>
                  <SelectedAvatar src={contact.avatar} alt={contact.name} />
                  <SelectedName>{contact.name}</SelectedName>
                  <RemoveButton onClick={() => handleRemoveContact(contact.id)}>
                    ×
                  </RemoveButton>
                </SelectedContact>
              ))}
            </SelectedContactsBar>
          )}
          
          <SearchBar>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput 
              placeholder="Search contacts" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          
          <ContactsList>
            {filteredContacts.map(contact => {
              const isSelected = selectedContacts.some(c => c.id === contact.id);
              
              return (
                <ContactItem 
                  key={contact.id} 
                  selected={isSelected}
                  onClick={() => handleContactSelect(contact)}
                >
                  <ContactAvatar src={contact.avatar} alt={contact.name} />
                  <ContactInfo>
                    <ContactName>{contact.name}</ContactName>
                    <ContactStatus>{contact.status}</ContactStatus>
                  </ContactInfo>
                  <CheckboxContainer selected={isSelected}>
                    {isSelected && <FaCheck size={14} />}
                  </CheckboxContainer>
                </ContactItem>
              );
            })}
          </ContactsList>
          
          <NextButton 
            onClick={handleNextStep}
            disabled={selectedContacts.length === 0}
          >
            <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
          </NextButton>
        </>
      ) : (
        <GroupInfoSection>
          <GroupAvatar src={groupAvatar}>
            {!groupAvatar ? (
              <CameraIcon onClick={handleAvatarUpload}>
                <FaCamera />
              </CameraIcon>
            ) : (
              <CameraIcon absolute onClick={handleAvatarUpload}>
                <FaCamera />
              </CameraIcon>
            )}
          </GroupAvatar>
          
          <GroupNameInput 
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
          
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Provide a group name and optional icon
          </div>
          
          <NextButton 
            onClick={handleNextStep}
            disabled={!groupName.trim()}
          >
            <FaCheck />
          </NextButton>
        </GroupInfoSection>
      )}
    </CreateGroupContainer>
  );
};

export default CreateGroup;

