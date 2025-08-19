import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEllipsisV, FaCommentAlt, FaCircleNotch, FaMoon, FaSun } from 'react-icons/fa';
import { currentUser } from '../../data/mockData';
import ProfileModal from '../Modals/ProfileModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useStory } from '../../contexts/StoryContext';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const IconsContainer = styled.div`
  display: flex;
  color: var(--icon-color);
`;

const IconWrapper = styled.div`
  margin-left: 22px;
  cursor: pointer;
  font-size: 20px;
  position: relative;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const StatusIconWrapper = styled(IconWrapper)`
  position: relative;
`;

const StatusDot = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: ${props => props.hasUnviewedStories ? 'block' : 'none'};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--dropdown-background);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  width: 200px;
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: var(--dropdown-hover);
  }
  
  svg {
    margin-right: 10px;
  }
`;

const SidebarHeader = ({ onStatusClick }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { hasUnviewedStories } = useStory();

  const handleMenuClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setShowDropdown(false);
  };

  return (
    <HeaderContainer>
      <UserInfo onClick={handleProfileClick}>
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
      </UserInfo>
      
      <IconsContainer>
        <StatusIconWrapper title="Status" onClick={onStatusClick}>
          <FaCircleNotch />
          <StatusDot hasUnviewedStories={hasUnviewedStories(2) || hasUnviewedStories(5) || hasUnviewedStories(10)} />
        </StatusIconWrapper>
        <IconWrapper title="New chat">
          <FaCommentAlt />
        </IconWrapper>
        <IconWrapper title="Menu" onClick={handleMenuClick}>
          <FaEllipsisV />
          <DropdownMenu isOpen={showDropdown}>
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            <MenuItem onClick={handleThemeToggle}>
              {darkMode ? <FaSun /> : <FaMoon />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Log out</MenuItem>
          </DropdownMenu>
        </IconWrapper>
      </IconsContainer>
      
      {showProfileModal && (
        <ProfileModal 
          user={currentUser} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </HeaderContainer>
  );
};

export default SidebarHeader;
