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
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardImage = styled.div`
  height: 200px;
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 180px;
  }
`;

const CardCategory = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme, category }) => 
    theme.colors.categoryColors[category] || theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: uppercase;
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  
  a {
    color: ${({ theme }) => theme.colors.dark};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray};
  margin-top: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

const CardSource = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const CardTime = styled.span``;

const ReadMoreLink = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: underline;
  }
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
      <CardImage src={getDefaultImage(article.urlToImage)}>
        <CardCategory category={category}>
          {category}
        </CardCategory>
      </CardImage>
      
      <CardContent>
        <CardTitle>
          <Link to={`/article/${articleId}`} onClick={handleArticleClick}>
            {article.title}
          </Link>
          {articleStatus && <StatusIndicator status={articleStatus} />}
        </CardTitle>
        
        <CardDescription>
          {truncateText(article.description, featured ? 150 : 100)}
        </CardDescription>
        
        <CardMeta>
          <CardSource>{article.source?.name || 'Unknown Source'}</CardSource>
          <CardTime>{timeAgo(article.publishedAt)}</CardTime>
        </CardMeta>
        
        <ReadMoreLink to={`/article/${articleId}`} onClick={handleArticleClick}>
          Read More <i className="fas fa-arrow-right"></i>
        </ReadMoreLink>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
