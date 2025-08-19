import React from 'react';
import styled from 'styled-components';
import StatusList from './StatusList';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';
import { useStory } from '../../contexts/StoryContext';
import { FaArrowLeft } from 'react-icons/fa';

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

const Status = ({ onClose }) => {
  const { showStoryViewer, showStoryCreator } = useStory();

  return (
    <StatusContainer>
      <StatusHeader>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>Status</HeaderTitle>
      </StatusHeader>
      <StatusList onClose={onClose} />
      
      {showStoryViewer && <StoryViewer />}
      {showStoryCreator && <StoryCreator />}
    </StatusContainer>
  );
};

export default Status;
