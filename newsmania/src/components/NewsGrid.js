import React from 'react';
import styled from 'styled-components';
import NewsCard from './NewsCard';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const EmptyStateIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  color: ${({ theme }) => theme.colors.lightGray};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyStateText = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NewsGrid = ({ articles, loading, error }) => {
  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <i className="fas fa-exclamation-circle"></i>
        </EmptyStateIcon>
        <EmptyStateTitle>Error Loading News</EmptyStateTitle>
        <EmptyStateText>{error}</EmptyStateText>
      </EmptyState>
    );
  }

  if (loading && (!articles || articles.length === 0)) {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <i className="fas fa-spinner fa-spin"></i>
        </EmptyStateIcon>
        <EmptyStateTitle>Loading News</EmptyStateTitle>
        <EmptyStateText>Please wait while we fetch the latest news for you.</EmptyStateText>
      </EmptyState>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <i className="fas fa-newspaper"></i>
        </EmptyStateIcon>
        <EmptyStateTitle>No News Found</EmptyStateTitle>
        <EmptyStateText>
          We couldn't find any news articles matching your criteria. 
          Try changing your search terms or category.
        </EmptyStateText>
      </EmptyState>
    );
  }

  return (
    <Grid>
      {articles.map((article, index) => (
        <NewsCard key={`${article.url}-${index}`} article={article} />
      ))}
    </Grid>
  );
};

export default NewsGrid;

