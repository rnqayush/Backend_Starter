import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';
import NewsGrid from '../components/NewsGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';

const CategoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const CategoryHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const CategoryTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme, category }) => 
    theme.colors.categoryColors[category] || theme.colors.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

const CategoryDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.gray};
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const getCategoryDescription = (category) => {
  const descriptions = {
    business: 'Stay updated with the latest business news, market trends, and economic developments.',
    technology: 'Discover the latest tech innovations, gadget reviews, and digital transformation stories.',
    entertainment: 'Get the latest updates on movies, music, celebrities, and the entertainment industry.',
    sports: 'Follow the latest sports news, match results, player updates, and sporting events.',
    health: 'Learn about health research, medical breakthroughs, wellness tips, and healthcare news.',
    science: 'Explore scientific discoveries, research breakthroughs, and advancements in various fields.',
    general: 'Browse through a diverse collection of top news stories from around the world.',
  };
  
  return descriptions[category] || 'Latest news and updates from around the world.';
};

const CategoryPage = () => {
  const { category } = useParams();
  const { 
    articles, 
    loading, 
    error, 
    totalResults, 
    hasMore, 
    params,
    loadMore, 
    changeCategory,
    changeCountry, 
    changeSortBy 
  } = useNewsContext();
  
  // Update category when component mounts or category changes
  useEffect(() => {
    changeCategory(category);
  }, [category, changeCategory]);
  
  // Capitalize category name for display
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <CategoryContainer>
      <CategoryHeader>
        <CategoryTitle category={category}>{categoryName} News</CategoryTitle>
        <CategoryDescription>
          {getCategoryDescription(category)}
        </CategoryDescription>
      </CategoryHeader>
      
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
    </CategoryContainer>
  );
};

export default CategoryPage;

