import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaTimes } from 'react-icons/fa';

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  border-bottom: 1px solid var(--border-color);
`;

const BackButton = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 15px;
  color: var(--text-primary);
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchControls = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

const SearchCount = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 10px;
`;

const ControlButton = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  margin: 0 5px;
  
  &:hover {
    color: var(--primary-color);
  }
  
  &:disabled {
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const ClearButton = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const MessageSearch = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(0);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Focus the input when component mounts
    inputRef.current.focus();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim()) {
      // This would normally search through actual messages
      // For demo purposes, we'll just simulate finding results
      const simulatedResults = [];
      for (let i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
        simulatedResults.push({
          id: i,
          text: `Message containing "${searchQuery}"`,
          element: null // In a real implementation, this would reference the DOM element
        });
      }
      setSearchResults(simulatedResults);
      setCurrentResult(0);
    } else {
      setSearchResults([]);
      setCurrentResult(0);
    }
  }, [searchQuery]);
  
  const handlePrevResult = () => {
    if (currentResult > 0) {
      setCurrentResult(currentResult - 1);
      // In a real implementation, we would scroll to the element
    }
  };
  
  const handleNextResult = () => {
    if (currentResult < searchResults.length - 1) {
      setCurrentResult(currentResult + 1);
      // In a real implementation, we would scroll to the element
    }
  };
  
  const handleClear = () => {
    setSearchQuery('');
    inputRef.current.focus();
  };
  
  return (
    <SearchContainer>
      <BackButton onClick={onClose}>
        <FaArrowLeft />
      </BackButton>
      
      <SearchInput 
        ref={inputRef}
        placeholder="Search messages"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {searchQuery && (
        <ClearButton onClick={handleClear}>
          <FaTimes />
        </ClearButton>
      )}
      
      {searchResults.length > 0 && (
        <SearchControls>
          <SearchCount>
            {currentResult + 1}/{searchResults.length}
          </SearchCount>
          
          <ControlButton 
            onClick={handlePrevResult}
            disabled={currentResult === 0}
          >
            <FaArrowUp />
          </ControlButton>
          
          <ControlButton 
            onClick={handleNextResult}
            disabled={currentResult === searchResults.length - 1}
          >
            <FaArrowDown />
          </ControlButton>
        </SearchControls>
      )}
    </SearchContainer>
  );
};

export default MessageSearch;

