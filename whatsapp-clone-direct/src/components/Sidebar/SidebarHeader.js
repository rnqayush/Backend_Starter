import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEllipsisV, FaUsers, FaCircleNotch, FaCommentAlt } from 'react-icons/fa';
import { currentUser } from '../../data/mockData';
import ProfileModal from '../Modals/ProfileModal';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 24px;
  color: var(--icon-color);
`;

const IconWrapper = styled.div`
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const SidebarHeader = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  return (
    <Header>
      <UserAvatar 
        src={currentUser.avatar} 
        alt={currentUser.name}
        onClick={() => setShowProfileModal(true)}
      />
      
      <IconsContainer>
        <IconWrapper title="Status">
          <FaCircleNotch />
        </IconWrapper>
        <IconWrapper title="New chat">
          <FaCommentAlt />
        </IconWrapper>
        <IconWrapper title="Communities">
          <FaUsers />
        </IconWrapper>
        <IconWrapper title="Menu">
          <FaEllipsisV />
        </IconWrapper>
      </IconsContainer>
      
      {showProfileModal && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </Header>
  );
};

export default SidebarHeader;

