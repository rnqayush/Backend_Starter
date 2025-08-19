import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoadMoreButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.lightGray};
    cursor: not-allowed;
  }
  
  i {
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

const ResultsInfo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Pagination = ({ loading, hasMore, totalResults, currentCount, loadMore }) => {
  return (
    <>
      <ResultsInfo>
        Showing {currentCount} of {totalResults} results
      </ResultsInfo>
      <PaginationContainer>
        <LoadMoreButton 
          onClick={loadMore} 
          disabled={loading || !hasMore}
        >
          {loading ? (
            <>
              Loading <i className="fas fa-spinner fa-spin"></i>
            </>
          ) : hasMore ? (
            <>
              Load More <i className="fas fa-chevron-down"></i>
            </>
          ) : (
            'No More Results'
          )}
        </LoadMoreButton>
      </PaginationContainer>
    </>
  );
};

export default Pagination;

