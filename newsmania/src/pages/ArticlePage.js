import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';
import { formatDateTime, getDefaultImage } from '../utils/helpers';
import { getMemoizedArticleStatus } from '../utils/statusUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusIndicator from '../components/StatusIndicator';

const ArticleContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  i {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const ArticleHeader = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ArticleTitle = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.dark};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray};
`;

const ArticleSource = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.darkGray};
`;

const ArticleDate = styled.span`
  color: ${({ theme }) => theme.colors.gray};
`;

const ArticleCategory = styled(Link)`
  display: inline-block;
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

const ArticleImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ArticleContent = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.dark};
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const SourceLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  i {
    margin-left: ${({ theme }) => theme.spacing.xs};
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, loading } = useNewsContext();
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    // Find the article by ID (URL slug)
    if (articles.length > 0) {
      const foundArticle = articles.find(article => {
        const articleId = article.url
          ? encodeURIComponent(article.url.split('/').pop() || '')
          : '';
        return articleId === id;
      });
      
      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        // Article not found, redirect to 404
        navigate('/not-found');
      }
    }
  }, [articles, id, navigate]);
  
  if (loading || !article) {
    return (
      <ArticleContainer>
        <LoadingSpinner text="Loading article..." />
      </ArticleContainer>
    );
  }
  
  // Determine category from source or default to general
  const category = article.category || 'general';
  
  // Get article status using our memoized utility function
  const articleStatus = getMemoizedArticleStatus(article);
  
  return (
    <ArticleContainer>
      <BackButton to="/">
        <i className="fas fa-arrow-left"></i> Back to Home
      </BackButton>
      
      <ArticleHeader>
        <ArticleTitle>
          {article.title}
          {articleStatus && <StatusIndicator status={articleStatus} />}
        </ArticleTitle>
        <ArticleMeta>
          <ArticleSource>
            {article.source?.name || 'Unknown Source'}
          </ArticleSource>
          <ArticleDate>
            {formatDateTime(article.publishedAt)}
          </ArticleDate>
          <ArticleCategory 
            to={`/category/${category}`}
            category={category}
          >
            {category}
          </ArticleCategory>
        </ArticleMeta>
      </ArticleHeader>
      
      <ArticleImage 
        src={getDefaultImage(article.urlToImage)} 
        alt={article.title} 
      />
      
      <ArticleContent>
        <p>{article.content || article.description}</p>
        
        {/* In a real app, we would have the full article content here */}
        <p>
          This is a preview of the article. To read the full article, please visit the original source.
        </p>
      </ArticleContent>
      
      <SourceLink 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Read Full Article <i className="fas fa-external-link-alt"></i>
      </SourceLink>
    </ArticleContainer>
  );
};

export default ArticlePage;

