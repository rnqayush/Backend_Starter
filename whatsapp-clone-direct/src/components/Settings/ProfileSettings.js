import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCamera, FaPencilAlt } from 'react-icons/fa';
import { currentUser } from '../../data/mockData';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: var(--background-lighter);
`;

const AvatarWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
`;

const CameraButton = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const InfoSection = styled.div`
  margin-top: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: var(--background-lighter);
  border-bottom: 1px solid var(--border-color);
`;

const InfoLabel = styled.div`
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
`;

const InfoText = styled.div`
  flex: 1;
`;

const EditButton = styled.div`
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const InfoDescription = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
`;

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const EditForm = styled.div`
  width: 90%;
  max-width: 400px;
  background-color: var(--background-lighter);
  border-radius: 8px;
  overflow: hidden;
`;

const EditHeader = styled.div`
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
`;

const EditContent = styled.div`
  padding: 16px;
`;

const EditInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: var(--primary-color);
  }
`;

const EditTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  resize: none;
  height: 100px;
  
  &:focus {
    border-color: var(--primary-color);
  }
`;

const CharCount = styled.div`
  text-align: right;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
`;

const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--border-color);
`;

const EditButton2 = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 8px;
  
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-color-dark)' : 'var(--hover-background)'};
  }
`;

const ProfileSettings = ({ onBack }) => {
  const [user, setUser] = useState(currentUser);
  const [editMode, setEditMode] = useState(null); // null, 'name', 'status'
  const [editValue, setEditValue] = useState('');
  
  const handleEdit = (field) => {
    setEditMode(field);
    setEditValue(field === 'name' ? user.name : user.status);
  };
  
  const handleCancel = () => {
    setEditMode(null);
    setEditValue('');
  };
  
  const handleSave = () => {
    if (editMode === 'name') {
      setUser({ ...user, name: editValue });
    } else if (editMode === 'status') {
      setUser({ ...user, status: editValue });
    }
    setEditMode(null);
  };
  
  const handleChange = (e) => {
    setEditValue(e.target.value);
  };
  
  return (
    <ProfileContainer>
      <AvatarSection>
        <AvatarWrapper>
          <Avatar src={user.avatar} alt={user.name} />
          <CameraButton>
            <FaCamera />
          </CameraButton>
        </AvatarWrapper>
      </AvatarSection>
      
      <InfoSection>
        <InfoItem>
          <InfoLabel>Name</InfoLabel>
          <InfoValue>
            <InfoText>{user.name}</InfoText>
            <EditButton onClick={() => handleEdit('name')}>
              <FaPencilAlt />
            </EditButton>
          </InfoValue>
        </InfoItem>
        
        <InfoItem>
          <InfoLabel>About</InfoLabel>
          <InfoValue>
            <InfoText>{user.status}</InfoText>
            <EditButton onClick={() => handleEdit('status')}>
              <FaPencilAlt />
            </EditButton>
          </InfoValue>
        </InfoItem>
        
        <InfoItem>
          <InfoLabel>Phone</InfoLabel>
          <InfoValue>
            <InfoText>{user.phone}</InfoText>
          </InfoValue>
        </InfoItem>
      </InfoSection>
      
      {editMode && (
        <EditModal>
          <EditForm>
            <EditHeader>
              {editMode === 'name' ? 'Edit name' : 'Edit about'}
            </EditHeader>
            <EditContent>
              {editMode === 'name' ? (
                <EditInput 
                  value={editValue}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  maxLength={25}
                />
              ) : (
                <>
                  <EditTextarea 
                    value={editValue}
                    onChange={handleChange}
                    placeholder="Enter your about"
                    maxLength={139}
                  />
                  <CharCount>{editValue.length}/139</CharCount>
                </>
              )}
            </EditContent>
            <EditActions>
              <EditButton2 onClick={handleCancel}>Cancel</EditButton2>
              <EditButton2 primary onClick={handleSave}>Save</EditButton2>
            </EditActions>
          </EditForm>
        </EditModal>
      )}
    </ProfileContainer>
  );
};

export default ProfileSettings;

