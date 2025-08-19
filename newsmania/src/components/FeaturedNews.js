import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { timeAgo, truncateText, getDefaultImage } from '../utils/helpers';
import { getMemoizedArticleStatus } from '../utils/statusUtils';
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
  grid-column: 1;
  grid-row: 1;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.8)
  ), url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.white};
  position: relative;
  overflow: hidden;
  
  &:hover {
    &::after {
      opacity: 1;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.9)
    );
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
    z-index: 1;
    pointer-events: none;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const SecondaryArticles = styled.div`
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const SecondaryArticle = styled.div`
  flex: 1;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.7)
  ), url(${props => props.image});
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.white};
  position: relative;
  overflow: hidden;
  
  &:hover {
    &::after {
      opacity: 1;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.8)
    );
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
    z-index: 1;
    pointer-events: none;
  }
`;

const ArticleCategory = styled.div`
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
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  z-index: 2;
`;

const ArticleTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${props => props.main ? 
    props.theme.fontSizes.xl : 
    props.theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.3;
  z-index: 2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${props => props.main ? 
      props.theme.fontSizes.lg : 
      props.theme.fontSizes.md};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  z-index: 2;
`;

const ArticleSource = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const ArticleTime = styled.span`
  opacity: 0.8;
`;

const ReadMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  margin-top: ${({ theme }) => theme.spacing.md};
  z-index: 2;
  
  &:hover {
    text-decoration: underline;
  }
  
  i {
    margin-left: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.fontSizes.xs};
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
          {(() => {
            const status = getMemoizedArticleStatus(mainArticle);
            return status && <StatusIndicator status={status} />;
          })()}
        </ArticleTitle>
        <ArticleMeta>
          <ArticleSource>{mainArticle.source?.name || 'Unknown Source'}</ArticleSource>
          <ArticleTime>{timeAgo(mainArticle.publishedAt)}</ArticleTime>
        </ArticleMeta>
        <ReadMoreLink 
          to={`/article/${getArticleId(mainArticle)}`}
          onClick={() => handleArticleClick(mainArticle)}
        >
          Read More <i className="fas fa-arrow-right"></i>
        </ReadMoreLink>
      </MainArticle>
      
      <SecondaryArticles>
        {secondaryArticles.map((article, index) => (
          <SecondaryArticle 
            key={article.url || index}
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
              {(() => {
                const status = getMemoizedArticleStatus(article);
                return status && <StatusIndicator status={status} />;
              })()}
            </ArticleTitle>
            <ArticleMeta>
              <ArticleSource>{article.source?.name || 'Unknown Source'}</ArticleSource>
              <ArticleTime>{timeAgo(article.publishedAt)}</ArticleTime>
            </ArticleMeta>
          </SecondaryArticle>
        ))}
      </SecondaryArticles>
    </FeaturedContainer>
  );
};

export default FeaturedNews;

