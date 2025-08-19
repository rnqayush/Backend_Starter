import React, { useState } from 'react';
import styled from 'styled-components';
import StatusList from './StatusList';
import StoryViewer from './StoryViewer';
import StatusCreator from './StatusCreator';
import { useStory } from '../../contexts/StoryContext';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const StatusContainer = styled.div`
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

const StatusHeader = styled.div`
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
`;

const CreateButton = styled.div`
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
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const Status = ({ onClose }) => {
  const { showStoryViewer, showStoryCreator, setShowStoryCreator } = useStory();

  const handleCreateStatus = () => {
    setShowStoryCreator(true);
  };

  if (showStoryCreator) {
    return <StatusCreator onClose={() => setShowStoryCreator(false)} />;
  }

  return (
    <StatusContainer>
      <StatusHeader>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>Status</HeaderTitle>
      </StatusHeader>
      <StatusList onClose={onClose} />
      
      <CreateButton onClick={handleCreateStatus}>
        <FaPlus />
      </CreateButton>
      
      {showStoryViewer && <StoryViewer />}
    </StatusContainer>
  );
};

export default Status;
