import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';
import FeaturedNews from '../components/FeaturedNews';
import NewsGrid from '../components/NewsGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.dark};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const HeroSection = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.light};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const HomePage = () => {
  const { 
    articles, 
    loading, 
    error, 
    totalResults, 
    hasMore, 
    params,
    loadMore, 
    changeCountry, 
    changeSortBy, 
    refreshNews 
  } = useNewsContext();
  
  // Reset to default params when component mounts
  useEffect(() => {
    refreshNews();
  }, []);
  
  // Get featured articles (first 3)
  const featuredArticles = articles.slice(0, 3);
  
  // Get remaining articles
  const remainingArticles = articles.slice(3);
  
  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Stay Informed with NewsMania</HeroTitle>
          <HeroSubtitle>
            Your trusted source for the latest news and updates from around the world
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>
      
      <HomeContainer>
        <FilterBar 
          totalResults={totalResults}
          country={params.country}
          sortBy={params.sortBy || 'publishedAt'}
          onCountryChange={changeCountry}
          onSortChange={changeSortBy}
        />
        
        {featuredArticles.length >= 3 && (
          <>
            <SectionTitle>Featured News</SectionTitle>
            <FeaturedNews articles={featuredArticles} />
          </>
        )}
        
        <SectionTitle>Latest News</SectionTitle>
        
        <NewsGrid 
          articles={remainingArticles} 
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
      </HomeContainer>
    </>
  );
};

export default HomePage;

