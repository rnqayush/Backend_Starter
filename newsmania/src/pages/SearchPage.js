import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';
import NewsGrid from '../components/NewsGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const SearchHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SearchTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.dark};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
  
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.gray};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  
  const { 
    articles, 
    loading, 
    error, 
    totalResults, 
    hasMore, 
    params,
    loadMore, 
    searchForNews,
    changeCountry, 
    changeSortBy 
  } = useNewsContext();
  
  // Update search when component mounts or search query changes
  useEffect(() => {
    if (searchQuery) {
      searchForNews(searchQuery);
    }
  }, [searchQuery, searchForNews]);
  
  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>
          Search Results for <span>"{searchQuery}"</span>
        </SearchTitle>
        <SearchDescription>
          {totalResults > 0 
            ? `Found ${totalResults} articles matching your search.` 
            : 'Searching for articles...'}
        </SearchDescription>
      </SearchHeader>
      
      <FilterBar 
        totalResults={totalResults}
        country={params.country}
        sortBy={params.sortBy || 'publishedAt'}
        onCountryChange={changeCountry}
        onSortChange={changeSortBy}
      />
      
      <NewsGrid 
        articles={articles} 
        loading={loading} 
        error={error} 
      />
      
      {loading && articles.length > 0 && (
        <LoadingSpinner text="Loading more articles..." />
      )}
      
      <Pagination 
        loading={loading}
        hasMore={hasMore}
        totalResults={totalResults}
        currentCount={articles.length}
        loadMore={loadMore}
      />
    </SearchContainer>
  );
};

export default SearchPage;

