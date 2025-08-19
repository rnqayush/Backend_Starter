import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { timeAgo, truncateText, getDefaultImage } from '../utils/helpers';
import { getMemoizedArticleStatus } from '../utils/statusUtils';
import { useNewsContext } from '../context/NewsContext';
import StatusIndicator from './StatusIndicator';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  transition: transform ${({ theme }) => theme.transitions.fast}, 
              box-shadow ${({ theme }) => theme.transitions.fast};
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardImage = styled.div`
  height: 180px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 140px;
  }
`;

const CardCategory = styled(Link)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme, category }) => {
    switch (category) {
      case 'business':
        return theme.colors.business;
      case 'entertainment':
        return theme.colors.entertainment;
      case 'health':
        return theme.colors.health;
      case 'science':
        return theme.colors.science;
      case 'sports':
        return theme.colors.sports;
      case 'technology':
        return theme.colors.technology;
      default:
        return theme.colors.primary;
    }
  }};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: uppercase;
  text-decoration: none;
  
  &:hover {
    opacity: 0.9;
  }
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.dark};
  line-height: 1.4;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const CardDescription = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray};
  line-height: 1.6;
  flex-grow: 1;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.darkGray};
`;

const CardSource = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CardTime = styled.span`
  color: ${({ theme }) => theme.colors.gray};
`;

const NewsCard = ({ article, featured = false }) => {
  const { selectArticle } = useNewsContext();
  
  // Generate a unique ID for the article if it doesn't have one
  const articleId = article.url
    ? encodeURIComponent(article.url.split('/').pop() || Date.now().toString())
    : Date.now().toString();
  
  // Determine category from source or default to general
  const category = article.category || 'general';
  
  // Get article status using memoized function
  const articleStatus = getMemoizedArticleStatus(article);
  
  // Handle click on article
  const handleArticleClick = () => {
    selectArticle(article);
  };
  
  return (
    <Card>
      <CardImage image={getDefaultImage(article.urlToImage)}>
        <CardCategory 
          to={`/category/${category}`}
          category={category}
        >
          {category}
        </CardCategory>
      </CardImage>
      <CardContent>
        <CardTitle>
          <Link 
            to={`/article/${articleId}`} 
            onClick={handleArticleClick}
          >
            {article.title}
          </Link>
          {articleStatus && <StatusIndicator status={articleStatus} />}
        </CardTitle>
        <CardDescription>
          {truncateText(article.description || '', featured ? 150 : 100)}
        </CardDescription>
        <CardMeta>
          <CardSource>{article.source?.name || 'Unknown Source'}</CardSource>
          <CardTime>{timeAgo(article.publishedAt)}</CardTime>
        </CardMeta>
      </CardContent>
    </Card>
  );
};

export default NewsCard;

