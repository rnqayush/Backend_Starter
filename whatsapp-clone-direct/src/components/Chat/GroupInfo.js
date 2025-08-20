import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaEllipsisV, 
  FaSearch, 
  FaCamera, 
  FaUserPlus,
  FaUserMinus,
  FaUserCog,
  FaLink,
  FaClipboard,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaTrash,
  FaCheck,
  FaTimes,
  FaEdit,
  FaBell,
  FaBellSlash,
  FaStar
} from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { contacts, currentUser } from '../../data/mockData';
import SharedMedia from '../Contact/SharedMedia';

const InfoContainer = styled.div`
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.div`
  margin-left: 24px;
  cursor: pointer;
`;

const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--background-lighter);
  position: relative;
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
  position: absolute;
  bottom: 10px;
  right: 10px;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const GroupName = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const EditIcon = styled.div`
  margin-left: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const GroupDescription = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`;

const GroupCreated = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: var(--background-lighter);
  margin-bottom: 8px;
`;

const ActionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  svg {
    font-size: 20px;
    color: var(--primary-color);
    margin-bottom: 8px;
  }
`;

const ActionText = styled.div`
  font-size: 13px;
  color: var(--text-primary);
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

const MediaSection = styled.div`
  margin-bottom: 8px;
`;

const MediaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  border-bottom: 1px solid var(--border-color);
`;

const MediaTitle = styled.div`
  color: var(--text-primary);
  font-weight: 500;
`;

const MediaCount = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
`;

const DangerSection = styled.div`
  margin-bottom: 24px;
`;

const DangerItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--background-lighter);
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
  
  svg {
    font-size: 20px;
    color: ${props => props.iconColor || 'var(--danger-color)'};
    margin-right: 16px;
  }
`;

const DangerText = styled.div`
  color: ${props => props.textColor || 'var(--danger-color)'};
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

const ModalInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 16px;
  outline: none;
  
  &:focus {
    border-color: var(--primary-color);
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 16px;
  outline: none;
  resize: none;
  height: 100px;
  
  &:focus {
    border-color: var(--primary-color);
  }
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

const InviteLink = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: var(--background);
  border-radius: 4px;
  margin-bottom: 16px;
  
  input {
    flex: 1;
    border: none;
    background-color: transparent;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
  }
  
  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
`;

const GroupInfo = ({ group, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);
  const [newGroupDescription, setNewGroupDescription] = useState(group.description || '');
  const [inviteLink, setInviteLink] = useState('');
  
  const { updateGroupInfo, leaveGroup, deleteGroup, addGroupMember, removeGroupMember } = useChat();
  
  const isAdmin = group.adminId === currentUser.id;
  
  // Get group members
  const groupMembers = contacts.filter(contact => group.members.includes(contact.id));
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handleEditName = () => {
    setIsEditingName(true);
  };
  
  const handleSaveName = () => {
    if (newGroupName.trim()) {
      updateGroupInfo(group.id, { name: newGroupName });
      setIsEditingName(false);
    }
  };
  
  const handleEditDescription = () => {
    setIsEditingDescription(true);
  };
  
  const handleSaveDescription = () => {
    updateGroupInfo(group.id, { description: newGroupDescription });
    setIsEditingDescription(false);
  };
  
  const handleGenerateLink = () => {
    setIsGeneratingLink(true);
    // In a real app, this would call an API to generate a link
    // For now, we'll just create a mock link
    setInviteLink(`https://chat.whatsapp.com/${Math.random().toString(36).substring(2, 10)}`);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    // Show a toast or notification that the link was copied
  };
  
  const handleLeaveGroup = () => {
    leaveGroup(group.id);
    onClose();
  };
  
  const handleDeleteGroup = () => {
    deleteGroup(group.id);
    onClose();
  };
  
  const handleMakeAdmin = (memberId) => {
    updateGroupInfo(group.id, { adminId: memberId });
  };
  
  const handleRemoveMember = (memberId) => {
    removeGroupMember(group.id, memberId);
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <InfoContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Group info</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaSearch />
          </ActionButton>
          <ActionButton>
            <FaEllipsisV />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <GroupSection>
        <GroupAvatar src={group.avatar}>
          {isAdmin && (
            <CameraIcon>
              <FaCamera />
            </CameraIcon>
          )}
        </GroupAvatar>
        
        <GroupName>
          {group.name}
          {isAdmin && (
            <EditIcon onClick={handleEditName}>
              <FaEdit />
            </EditIcon>
          )}
        </GroupName>
        
        <GroupDescription>
          {group.description || 'Add group description'}
          {isAdmin && (
            <EditIcon onClick={handleEditDescription}>
              <FaEdit />
            </EditIcon>
          )}
        </GroupDescription>
        
        <GroupCreated>
          Group created on {formatDate(group.createdAt)}
        </GroupCreated>
      </GroupSection>
      
      <ActionSection>
        <ActionItem>
          <FaSearch />
          <ActionText>Search</ActionText>
        </ActionItem>
        <ActionItem onClick={handleMuteToggle}>
          {isMuted ? <FaBellSlash /> : <FaBell />}
          <ActionText>{isMuted ? 'Unmute' : 'Mute'}</ActionText>
        </ActionItem>
        <ActionItem>
          <FaStar />
          <ActionText>Starred</ActionText>
        </ActionItem>
      </ActionSection>
      
      {isAdmin && (
        <SettingsSection>
          <SectionTitle>Group settings</SectionTitle>
          
          <SettingItem onClick={handleGenerateLink}>
            <SettingInfo>
              <FaLink />
              <SettingText>Group invite link</SettingText>
            </SettingInfo>
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <FaUserCog />
              <div>
                <SettingText>Edit group admins</SettingText>
                <SettingDescription>
                  Choose who can edit group info
                </SettingDescription>
              </div>
            </SettingInfo>
          </SettingItem>
        </SettingsSection>
      )}
      
      <MembersSection>
        <SectionTitle>{group.members.length} participants</SectionTitle>
        
        {isAdmin && (
          <SettingItem>
            <SettingInfo>
              <FaUserPlus />
              <SettingText>Add participants</SettingText>
            </SettingInfo>
          </SettingItem>
        )}
        
        {groupMembers.map(member => (
          <MemberItem key={member.id}>
            <MemberAvatar src={member.avatar} alt={member.name} />
            <MemberInfo>
              <MemberName>
                {member.name}
                {member.id === currentUser.id && ' (You)'}
                {member.id === group.adminId && <AdminBadge>Admin</AdminBadge>}
              </MemberName>
              <MemberStatus>{member.status}</MemberStatus>
            </MemberInfo>
            
            {isAdmin && member.id !== currentUser.id && (
              <MemberActions>
                {member.id !== group.adminId && (
                  <MemberAction onClick={() => handleMakeAdmin(member.id)}>
                    <FaUserCog />
                  </MemberAction>
                )}
                <MemberAction danger onClick={() => handleRemoveMember(member.id)}>
                  <FaUserMinus />
                </MemberAction>
              </MemberActions>
            )}
          </MemberItem>
        ))}
      </MembersSection>
      
      <MediaSection>
        <MediaHeader>
          <MediaTitle>Media, links, and docs</MediaTitle>
          <MediaCount>20 ›</MediaCount>
        </MediaHeader>
        
        <SharedMedia contactId={group.id} />
      </MediaSection>
      
      <DangerSection>
        {isAdmin ? (
          <DangerItem onClick={() => setIsConfirmingDelete(true)}>
            <FaTrash />
            <DangerText>Delete group</DangerText>
          </DangerItem>
        ) : (
          <DangerItem onClick={() => setIsConfirmingExit(true)}>
            <FaSignOutAlt />
            <DangerText>Exit group</DangerText>
          </DangerItem>
        )}
        
        <DangerItem>
          <FaExclamationTriangle />
          <DangerText>Report group</DangerText>
        </DangerItem>
      </DangerSection>
      
      {/* Edit Group Name Modal */}
      {isEditingName && (
        <Modal>
          <ModalContent>
            <ModalHeader>Edit group name</ModalHeader>
            <ModalBody>
              <ModalInput 
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                autoFocus
              />
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsEditingName(false)}>Cancel</ModalButton>
              <ModalButton primary onClick={handleSaveName}>Save</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
      
      {/* Edit Group Description Modal */}
      {isEditingDescription && (
        <Modal>
          <ModalContent>
            <ModalHeader>Edit group description</ModalHeader>
            <ModalBody>
              <ModalTextarea 
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Group description"
                autoFocus
              />
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsEditingDescription(false)}>Cancel</ModalButton>
              <ModalButton primary onClick={handleSaveDescription}>Save</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
      
      {/* Generate Invite Link Modal */}
      {isGeneratingLink && (
        <Modal>
          <ModalContent>
            <ModalHeader>Group invite link</ModalHeader>
            <ModalBody>
              <p style={{ marginBottom: '16px' }}>Share this link with people you want to invite to this group:</p>
              
              <InviteLink>
                <input value={inviteLink} readOnly />
                <button onClick={handleCopyLink}>Copy</button>
              </InviteLink>
              
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Anyone with WhatsApp can follow this link to join this group. Only share it with people you trust.
              </p>
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsGeneratingLink(false)}>Close</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
      
      {/* Confirm Exit Group Modal */}
      {isConfirmingExit && (
        <Modal>
          <ModalContent>
            <ModalHeader>Exit group</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to exit this group?</p>
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsConfirmingExit(false)}>Cancel</ModalButton>
              <ModalButton danger onClick={handleLeaveGroup}>Exit</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
      
      {/* Confirm Delete Group Modal */}
      {isConfirmingDelete && (
        <Modal>
          <ModalContent>
            <ModalHeader>Delete group</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this group? This action cannot be undone.</p>
            </ModalBody>
            <ModalActions>
              <ModalButton onClick={() => setIsConfirmingDelete(false)}>Cancel</ModalButton>
              <ModalButton danger onClick={handleDeleteGroup}>Delete</ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </InfoContainer>
  );
};

export default GroupInfo;

