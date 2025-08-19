import React, { createContext, useContext, useState, useCallback } from 'react';
import useNews from '../hooks/useNews';

// Create context
const NewsContext = createContext();

// News provider component
export const NewsProvider = ({ children }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize useNews hook with default parameters
  const {
    articles,
    loading,
    error,
    totalResults,
    hasMore,
    params,
    loadMore,
    changeCategory,
    searchForNews,
    changeCountry,
    changeSortBy,
    refreshNews,
  } = useNews({
    country: 'us',
    pageSize: 10,
    page: 1,
  });

  // Handle article selection
  const selectArticle = useCallback((article) => {
    setSelectedArticle(article);
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    searchForNews(query);
  }, [searchForNews]);

  // Value to be provided to consumers
  const value = {
    articles,
    loading,
    error,
    totalResults,
    hasMore,
    params,
    selectedArticle,
    searchQuery,
    loadMore,
    changeCategory,
    searchForNews: handleSearch,
    changeCountry,
    changeSortBy,
    selectArticle,
    refreshNews,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

// Custom hook to use the news context
export const useNewsContext = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNewsContext must be used within a NewsProvider');
  }
  return context;
};

export default NewsContext;

