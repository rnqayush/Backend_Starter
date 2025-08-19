import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaCamera, FaPen } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--modal-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 3px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 17px 50px 0 rgba(0, 0, 0, 0.19), 0 12px 15px 0 rgba(0, 0, 0, 0.24);
`;

const ModalHeader = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 19px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const ProfileContent = styled.div`
  padding: 20px;
`;

const AvatarSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
`;

const Avatar = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 10px;
  right: 50%;
  transform: translateX(80px);
  background-color: var(--primary-color);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  margin-bottom: 15px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditIcon = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ProfileModal = ({ user, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Profile</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ProfileContent>
          <AvatarSection>
            <Avatar src={user.avatar} alt={user.name} />
            <CameraIcon>
              <FaCamera />
            </CameraIcon>
          </AvatarSection>
          
          <InfoSection>
            <InfoItem>
              <InfoLabel>Your Name</InfoLabel>
              <InfoValue>
                {user.name}
                <EditIcon>
                  <FaPen />
                </EditIcon>
              </InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>About</InfoLabel>
              <InfoValue>
                {user.status}
                <EditIcon>
                  <FaPen />
                </EditIcon>
              </InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue>
                {user.phone}
              </InfoValue>
            </InfoItem>
          </InfoSection>
        </ProfileContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProfileModal;

