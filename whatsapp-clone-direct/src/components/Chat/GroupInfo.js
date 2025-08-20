import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCamera, FaUserPlus, FaSignOutAlt, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { contacts, currentUser } from '../../data/mockData';

const GroupInfoContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 30%;
  min-width: 300px;
  height: 100%;
  background-color: var(--sidebar-background);
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--sidebar-header);
  color: var(--text-primary);
`;

const CloseButton = styled.div`
  cursor: pointer;
  font-size: 20px;
  color: var(--icon-color);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const GroupProfile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
`;

const GroupAvatar = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 20px;
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const GroupName = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
`;

const EditIcon = styled.div`
  margin-left: 10px;
  cursor: pointer;
  color: var(--icon-color);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const GroupDescription = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 10px;
`;

const GroupCreated = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const Section = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
`;

const SectionTitle = styled.div`
  font-size: 14px;
  color: var(--primary-color);
  margin-bottom: 15px;
  font-weight: 500;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const MemberAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const MemberStatus = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const AddMemberButton = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: var(--primary-color);
  cursor: pointer;
  
  svg {
    margin-right: 15px;
  }
  
  &:hover {
    opacity: 0.8;
  }
`;

const ActionButton = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  color: ${props => props.danger ? 'var(--error-color)' : 'var(--text-primary)'};
  cursor: pointer;
  
  svg {
    margin-right: 15px;
  }
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const EditNameInput = styled.input`
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  background-color: transparent;
  border: none;
  border-bottom: 2px solid var(--primary-color);
  outline: none;
  padding: 5px 0;
  margin-bottom: 5px;
  width: 100%;
  text-align: center;
`;

const GroupInfo = ({ group, onClose }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const { leaveGroup, deleteGroup } = useChat();
  
  const handleEditName = () => {
    setIsEditingName(true);
  };
  
  const handleSaveName = () => {
    // In a real app, this would update the group name in the database
    setIsEditingName(false);
  };
  
  const handleLeaveGroup = () => {
    leaveGroup(group.id);
    onClose();
  };
  
  const handleDeleteGroup = () => {
    deleteGroup(group.id);
    onClose();
  };
  
  const isAdmin = group.adminId === currentUser.id;
  
  return (
    <GroupInfoContainer>
      <Header>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <Title>Group Info</Title>
        <div style={{ width: '20px' }}></div> {/* Spacer for alignment */}
      </Header>
      
      <GroupProfile>
        <GroupAvatar src={group.avatar}>
          <CameraIcon>
            <FaCamera />
          </CameraIcon>
        </GroupAvatar>
        
        {isEditingName ? (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <EditNameInput 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
            <EditIcon onClick={handleSaveName}>
              <FaCheck />
            </EditIcon>
          </div>
        ) : (
          <GroupName>
            {groupName}
            {isAdmin && (
              <EditIcon onClick={handleEditName}>
                <FaEdit />
              </EditIcon>
            )}
          </GroupName>
        )}
        
        <GroupDescription>
          {group.description || 'No description'}
        </GroupDescription>
        
        <GroupCreated>
          Group created on {new Date(group.createdAt).toLocaleDateString()}
        </GroupCreated>
      </GroupProfile>
      
      <Section>
        <SectionTitle>{group.members.length} PARTICIPANTS</SectionTitle>
        <MembersList>
          {group.members.map(memberId => {
            const member = memberId === currentUser.id 
              ? currentUser 
              : contacts.find(c => c.id === memberId);
            
            return (
              <MemberItem key={memberId}>
                <MemberAvatar src={member.avatar} alt={member.name} />
                <MemberInfo>
                  <MemberName>
                    {member.name} {memberId === currentUser.id && '(You)'} {memberId === group.adminId && '(Admin)'}
                  </MemberName>
                  <MemberStatus>{member.status}</MemberStatus>
                </MemberInfo>
              </MemberItem>
            );
          })}
          
          {isAdmin && (
            <AddMemberButton>
              <FaUserPlus />
              Add participant
            </AddMemberButton>
          )}
        </MembersList>
      </Section>
      
      <Section>
        <ActionButton onClick={() => {}}>
          <FaEdit />
          Edit group description
        </ActionButton>
      </Section>
      
      <Section>
        <ActionButton danger onClick={handleLeaveGroup}>
          <FaSignOutAlt />
          Exit group
        </ActionButton>
        
        {isAdmin && (
          <ActionButton danger onClick={handleDeleteGroup}>
            <FaTrash />
            Delete group
          </ActionButton>
        )}
      </Section>
    </GroupInfoContainer>
  );
};

export default GroupInfo;

