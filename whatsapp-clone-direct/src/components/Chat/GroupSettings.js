import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaUserCog, 
  FaLock, 
  FaUsers, 
  FaUserPlus,
  FaUserMinus,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { contacts, currentUser } from '../../data/mockData';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
  overflow-y: auto;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 450px;
  z-index: 1000;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
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

const SectionTitle = styled.div`
  padding: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  background-color: var(--background);
  font-weight: 500;
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

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--background-lighter);
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const RadioButton = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--primary-color);
    display: ${props => props.selected ? 'block' : 'none'};
  }
`;

const RadioText = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-size: 16px;
  color: var(--text-primary);
`;

const RadioDescription = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const MembersSection = styled.div`
  margin-bottom: 8px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--background-lighter);
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const MemberAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
`;

const AdminBadge = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--background);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
`;

const MemberStatus = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const MemberActions = styled.div`
  display: flex;
`;

const MemberAction = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  svg {
    font-size: 16px;
    color: ${props => props.danger ? 'var(--danger-color)' : 'var(--icon-color)'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
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

const ModalBody = styled.div`
  padding: 16px;
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
  margin-left: 8px;
  
  background-color: ${props => props.primary ? 'var(--primary-color)' : props.danger ? 'var(--danger-color)' : 'transparent'};
  color: ${props => (props.primary || props.danger) ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-color-dark)' : props.danger ? 'var(--danger-color-dark)' : 'var(--hover-background)'};
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
  max-height: 300px;
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

const GroupSettings = ({ group, onClose }) => {
  const [activeSection, setActiveSection] = useState('main');
  const [editPermission, setEditPermission] = useState(group.editPermission || 'admin-only');
  const [sendMessagesPermission, setSendMessagesPermission] = useState(group.sendMessagesPermission || 'all-participants');
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  
  const { updateGroupInfo, removeGroupMember, addGroupMember } = useChat();
  
  const isAdmin = group.adminId === currentUser.id;
  
  // Get group members
  const groupMembers = contacts.filter(contact => group.members.includes(contact.id));
  
  // Get contacts not in the group
  const nonGroupContacts = contacts.filter(contact => 
    !group.members.includes(contact.id) && 
    contact.id !== currentUser.id &&
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleBack = () => {
    if (activeSection === 'main') {
      onClose();
    } else {
      setActiveSection('main');
    }
  };
  
  const handleEditPermissionChange = (value) => {
    setEditPermission(value);
    updateGroupInfo(group.id, { editPermission: value });
  };
  
  const handleSendMessagesPermissionChange = (value) => {
    setSendMessagesPermission(value);
    updateGroupInfo(group.id, { sendMessagesPermission: value });
  };
  
  const handleRemoveMember = () => {
    if (selectedMember) {
      removeGroupMember(group.id, selectedMember.id);
      setIsConfirmingRemove(false);
      setSelectedMember(null);
    }
  };
  
  const handleContactSelect = (contact) => {
    if (selectedContacts.some(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };
  
  const handleAddParticipants = () => {
    selectedContacts.forEach(contact => {
      addGroupMember(group.id, contact.id);
    });
    setIsAddingParticipants(false);
    setSelectedContacts([]);
  };
  
  return (
    <SettingsContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
          </BackButton>
          <h1>
            {activeSection === 'main' ? 'Group settings' : 
             activeSection === 'edit-info' ? 'Edit group info' : 
             activeSection === 'send-messages' ? 'Send messages' : 
             activeSection === 'admins' ? 'Group admins' : 'Group settings'}
          </h1>
        </HeaderTitle>
      </Header>
      
      {activeSection === 'main' && (
        <>
          <SettingsSection>
            <SettingItem onClick={() => setActiveSection('edit-info')}>
              <SettingInfo>
                <FaUserCog />
                <div>
                  <SettingText>Edit group info</SettingText>
                  <SettingDescription>
                    {editPermission === 'admin-only' ? 'Only admins' : 'All participants'}
                  </SettingDescription>
                </div>
              </SettingInfo>
            </SettingItem>
            
            <SettingItem onClick={() => setActiveSection('send-messages')}>
              <SettingInfo>
                <FaLock />
                <div>
                  <SettingText>Send messages</SettingText>
                  <SettingDescription>
                    {sendMessagesPermission === 'admin-only' ? 'Only admins' : 'All participants'}
                  </SettingDescription>
                </div>
              </SettingInfo>
            </SettingItem>
          </SettingsSection>
          
          <SettingsSection>
            <SettingItem onClick={() => setActiveSection('admins')}>
              <SettingInfo>
                <FaUserCog />
                <SettingText>Group admins</SettingText>
              </SettingInfo>
            </SettingItem>
            
            <SettingItem onClick={() => setIsAddingParticipants(true)}>
              <SettingInfo>
                <FaUserPlus />
                <SettingText>Add participants</SettingText>
              </SettingInfo>
            </SettingItem>
          </SettingsSection>
          
          <SettingsSection>
            <SettingItem>
              <SettingInfo iconColor="var(--danger-color)">
                <FaExclamationTriangle />
                <SettingText>Report group</SettingText>
              </SettingInfo>
            </SettingItem>
          </SettingsSection>
        </>
      )}
      
      {activeSection === 'edit-info' && (
        <SettingsSection>
          <SectionTitle>Who can edit this group's info</SectionTitle>
          
          <RadioOption 
            selected={editPermission === 'admin-only'}
            onClick={() => handleEditPermissionChange('admin-only')}
          >
            <RadioButton selected={editPermission === 'admin-only'} />
            <RadioText>
              <RadioTitle>Only admins</RadioTitle>
              <RadioDescription>
                Only group admins can edit the group name, icon, and description
              </RadioDescription>
            </RadioText>
          </RadioOption>
          
          <RadioOption 
            selected={editPermission === 'all-participants'}
            onClick={() => handleEditPermissionChange('all-participants')}
          >
            <RadioButton selected={editPermission === 'all-participants'} />
            <RadioText>
              <RadioTitle>All participants</RadioTitle>
              <RadioDescription>
                All group participants can edit the group name, icon, and description
              </RadioDescription>
            </RadioText>
          </RadioOption>
        </SettingsSection>
      )}
      
      {activeSection === 'send-messages' && (
        <SettingsSection>
          <SectionTitle>Who can send messages to this group</SectionTitle>
          
          <RadioOption 
            selected={sendMessagesPermission === 'all-participants'}
            onClick={() => handleSendMessagesPermissionChange('all-participants')}
          >
            <RadioButton selected={sendMessagesPermission === 'all-participants'} />
            <RadioText>
              <RadioTitle>All participants</RadioTitle>
              <RadioDescription>
                All group participants can send messages to this group
              </RadioDescription>
            </RadioText>
          </RadioOption>
          
          <RadioOption 
            selected={sendMessagesPermission === 'admin-only'}
            onClick={() => handleSendMessagesPermissionChange('admin-only')}
          >
            <RadioButton selected={sendMessagesPermission === 'admin-only'} />
            <RadioText>
              <RadioTitle>Only admins</RadioTitle>
              <RadioDescription>
                Only group admins can send messages to this group
              </RadioDescription>
            </RadioText>
          </RadioOption>
        </SettingsSection>
      )}
      
      {activeSection === 'admins' && (
        <MembersSection>
          <SectionTitle>Group admins</SectionTitle>
          
          {groupMembers.map(member => {
            const isGroupAdmin = member.id === group.adminId;
            
            return (
              <MemberItem key={member.id}>
                <MemberAvatar src={member.avatar} alt={member.name} />
                <MemberInfo>
                  <MemberName>
                    {member.name}
                    {member.id === currentUser.id && ' (You)'}
                    {isGroupAdmin && <AdminBadge>Admin</AdminBadge>}
                  </MemberName>
                  <MemberStatus>{member.status}</MemberStatus>
                </MemberInfo>
                
                {isAdmin && member.id !== currentUser.id && (
                  <MemberActions>
                    {!isGroupAdmin ? (
                      <MemberAction onClick={() => updateGroupInfo(group.id, { adminId: member.id })}>
                        <FaUserCog />
                      </MemberAction>
                    ) : (
                      <MemberAction onClick={() => updateGroupInfo(group.id, { adminId: currentUser.id })}>
                        <FaUserMinus />
                      </MemberAction>
                    )}
                    <MemberAction danger onClick={() => {
                      setSelectedMember(member);
                      setIsConfirmingRemove(true);
                    }}>
                      <FaTimes />
                    </MemberAction>
                  </MemberActions>
                )}
              </MemberItem>
            );
          })}
        </MembersSection>
      )}
      
      {/* Confirm Remove Member Modal */}
      {isConfirmingRemove && selectedMember && (
        <Modal>
          <ModalContent>
            <ModalHeader>Remove {selectedMember.name}</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to remove {selectedMember.name} from the group?</p>
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsConfirmingRemove(false)}>Cancel</ModalButton>
              <ModalButton danger onClick={handleRemoveMember}>Remove</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
      
      {/* Add Participants Modal */}
      {isAddingParticipants && (
        <Modal>
          <ModalContent>
            <ModalHeader>Add participants</ModalHeader>
            <ModalBody>
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
                {nonGroupContacts.map(contact => {
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
                
                {nonGroupContacts.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No contacts found
                  </div>
                )}
              </ContactsList>
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => {
                setIsAddingParticipants(false);
                setSelectedContacts([]);
              }}>Cancel</ModalButton>
              <ModalButton 
                primary 
                onClick={handleAddParticipants}
                disabled={selectedContacts.length === 0}
              >
                Add
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </SettingsContainer>
  );
};

export default GroupSettings;

