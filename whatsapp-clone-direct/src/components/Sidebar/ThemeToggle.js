import React from 'react';
import styled from 'styled-components';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--icon-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: var(--sidebar-background);
`;

const TextContainer = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 3px;
`;

const Description = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();
  
  return (
    <ThemeToggleContainer onClick={toggleTheme}>
      <IconContainer>
        {darkMode ? <FaSun /> : <FaMoon />}
      </IconContainer>
      <TextContainer>
        <Title>{darkMode ? 'Light Mode' : 'Dark Mode'}</Title>
        <Description>
          {darkMode 
            ? 'Switch to light theme' 
            : 'Switch to dark theme'}
        </Description>
      </TextContainer>
    </ThemeToggleContainer>
  );
};

export default ThemeToggle;

