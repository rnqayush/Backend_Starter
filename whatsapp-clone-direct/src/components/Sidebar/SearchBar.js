import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-background);
  padding: 7px 10px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--search-background);
  border-radius: 8px;
  padding: 0 8px;
  height: 35px;
  position: relative;
`;

const SearchIcon = styled.div`
  color: var(--icon-color);
  margin-right: 10px;
  font-size: 14px;
`;

const FilterIcon = styled.div`
  color: var(--icon-color);
  margin-left: 10px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  color: var(--text-primary);
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <SearchContainer>
      <SearchInputContainer>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput 
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FilterIcon>
          <FaFilter />
        </FilterIcon>
      </SearchInputContainer>
    </SearchContainer>
  );
};

export default SearchBar;

