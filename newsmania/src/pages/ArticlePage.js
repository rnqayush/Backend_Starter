import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';
import { formatDateTime, getDefaultImage } from '../utils/helpers';
import { getMemoizedArticleStatus } from '../utils/statusUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusIndicator from '../components/StatusIndicator';

const ArticleContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const ArticleHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ArticleTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.3;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const ArticleSource = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ArticleDate = styled.div``;

const ArticleCategory = styled(Link)`
  background-color: ${({ theme, category }) => 
    theme.colors.categoryColors[category] || theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  text-transform: uppercase;
  
  &:hover {
    opacity: 0.9;
    color: ${({ theme }) => theme.colors.white};
  }
`;

const ArticleImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ArticleContent = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const SourceLink = styled.a`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing.lg};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
  }
  
  i {
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-decoration: none;
  
  i {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const NotFoundMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const NotFoundTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.dark};
`;

const NotFoundText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, selectedArticle, loading } = useNewsContext();
  const [article, setArticle] = useState(null);
  
  // Find the article either from selectedArticle or by searching through articles
  useEffect(() => {
    if (selectedArticle) {
      setArticle(selectedArticle);
    } else {
      // Try to find the article in the current articles list
      const foundArticle = articles.find(article => {
        const articleId = article.url
          ? encodeURIComponent(article.url.split('/').pop() || '')
          : '';
        return articleId === id;
      });
      
      if (foundArticle) {
        setArticle(foundArticle);
      }
    }
  }, [id, selectedArticle, articles]);
  
  // If article not found and not loading, show not found message
  if (!article && !loading) {
    return (
      <ArticleContainer>
        <BackButton to="/">
          <i className="fas fa-arrow-left"></i> Back to Home
        </BackButton>
        
        <NotFoundMessage>
          <NotFoundTitle>Article Not Found</NotFoundTitle>
          <NotFoundText>
            The article you're looking for could not be found. It may have been removed or is no longer available.
          </NotFoundText>
          <SourceLink as={Link} to="/">
            Return to Home Page
          </SourceLink>
        </NotFoundMessage>
      </ArticleContainer>
    );
  }
  
  // Show loading spinner while article is being fetched
  if (!article) {
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
