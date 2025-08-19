import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.dark};
  white-space: nowrap;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background-color: ${({ theme }) => theme.colors.white};
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResultCount = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.gray};
`;

const countries = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'in', name: 'India' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
];

const sortOptions = [
  { value: 'publishedAt', label: 'Newest First' },
  { value: 'relevancy', label: 'Relevancy' },
  { value: 'popularity', label: 'Popularity' },
];

const FilterBar = ({ 
  totalResults, 
  country, 
  sortBy, 
  onCountryChange, 
  onSortChange 
}) => {
  return (
    <FilterContainer>
      <FilterGroup>
        <FilterLabel htmlFor="country-select">Country:</FilterLabel>
        <Select 
          id="country-select" 
          value={country} 
          onChange={(e) => onCountryChange(e.target.value)}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="sort-select">Sort By:</FilterLabel>
        <Select 
          id="sort-select" 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterGroup>
      
      {totalResults > 0 && (
        <ResultCount>
          {totalResults} {totalResults === 1 ? 'result' : 'results'} found
        </ResultCount>
      )}
    </FilterContainer>
  );
};

export default FilterBar;

