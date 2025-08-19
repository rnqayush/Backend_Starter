import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { timeAgo, truncateText, getDefaultImage } from '../utils/helpers';
import { getArticleStatus } from '../utils/statusUtils';
import { useNewsContext } from '../context/NewsContext';
import StatusIndicator from './StatusIndicator';

const FeaturedContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 400px;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 300px;
  }
`;

const MainArticle = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.8)
  ), url(${({ image }) => image});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.xl};
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.01);
  }
`;

const SecondaryArticlesContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SecondaryArticle = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.8)
  ), url(${({ image }) => image});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.lg};
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.01);
  }
`;

const ArticleCategory = styled.span`
  background-color: ${({ theme, category }) => 
    theme.colors.categoryColors[category] || theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ArticleTitle = styled.h3`
  font-size: ${({ main, theme }) => main ? theme.fontSizes['2xl'] : theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ main, theme }) => main ? theme.fontSizes.xl : theme.fontSizes.lg};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.lightGray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ArticleSource = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ArticleTime = styled.span``;

const ReadMoreLink = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FeaturedNews = ({ articles }) => {
  const { selectArticle } = useNewsContext();
  
  if (!articles || articles.length < 3) {
    return null;
  }
  
  const mainArticle = articles[0];
  const secondaryArticles = [articles[1], articles[2]];
  
  // Generate article IDs
  const getArticleId = (article) => {
    return article.url
      ? encodeURIComponent(article.url.split('/').pop() || Date.now().toString())
      : Date.now().toString();
  };
  
  // Note: We're now using the centralized getArticleStatus function from statusUtils
  
  // Handle article click
  const handleArticleClick = (article) => {
    selectArticle(article);
  };
  
  return (
    <FeaturedContainer>
      <MainArticle image={getDefaultImage(mainArticle.urlToImage)}>
        <ArticleCategory category={mainArticle.category || 'general'}>
          {mainArticle.category || 'General'}
        </ArticleCategory>
        <ArticleTitle main>
          <Link 
            to={`/article/${getArticleId(mainArticle)}`} 
            onClick={() => handleArticleClick(mainArticle)}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {mainArticle.title}
          </Link>
          {getArticleStatus(mainArticle) && (
            <StatusIndicator status={getArticleStatus(mainArticle)} />
          )}
        </ArticleTitle>
        <ArticleMeta>
          <ArticleSource>{mainArticle.source?.name || 'Unknown Source'}</ArticleSource>
          <ArticleTime>{timeAgo(mainArticle.publishedAt)}</ArticleTime>
        </ArticleMeta>
        <ReadMoreLink 
          to={`/article/${getArticleId(mainArticle)}`}
          onClick={() => handleArticleClick(mainArticle)}
        >
          Read More
        </ReadMoreLink>
      </MainArticle>
      
      <SecondaryArticlesContainer>
        {secondaryArticles.map((article, index) => (
          <SecondaryArticle 
            key={index} 
            image={getDefaultImage(article.urlToImage)}
          >
            <ArticleCategory category={article.category || 'general'}>
              {article.category || 'General'}
            </ArticleCategory>
            <ArticleTitle>
              <Link 
                to={`/article/${getArticleId(article)}`} 
                onClick={() => handleArticleClick(article)}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {article.title}
              </Link>
              {getArticleStatus(article) && (
                <StatusIndicator status={getArticleStatus(article)} />
              )}
            </ArticleTitle>
            <ArticleMeta>
              <ArticleSource>{article.source?.name || 'Unknown Source'}</ArticleSource>
              <ArticleTime>{timeAgo(article.publishedAt)}</ArticleTime>
            </ArticleMeta>
          </SecondaryArticle>
        ))}
      </SecondaryArticlesContainer>
    </FeaturedContainer>
  );
};

export default FeaturedNews;
