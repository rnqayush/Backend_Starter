import { useState, useEffect, useCallback } from 'react';
import { getTopHeadlines, searchNews } from '../api/newsApi';

const useNews = (initialParams = {}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Merge new params with existing params
      const mergedParams = { ...params, ...newParams };
      
      // Determine which API to call based on params
      let response;
      if (mergedParams.query && !mergedParams.category) {
        response = await searchNews(mergedParams);
      } else {
        response = await getTopHeadlines(mergedParams);
      }
      
      const { articles: newArticles, totalResults: total } = response;
      
      // If it's a new search or category change, replace articles
      // Otherwise append to existing articles (for pagination)
      if (mergedParams.page === 1) {
        setArticles(newArticles);
      } else {
        setArticles(prevArticles => [...prevArticles, ...newArticles]);
      }
      
      setTotalResults(total);
      setHasMore(newArticles.length > 0 && articles.length + newArticles.length < total);
      setParams(mergedParams);
    } catch (err) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [params, articles.length]);

  // Initial fetch
  useEffect(() => {
    fetchNews(initialParams);
  }, []);

  // Function to load more articles
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNews({ page: params.page + 1 });
    }
  }, [ loading, hasMore, params.page]);

  // Function to change category
  const changeCategory = useCallback((category) => {
    fetchNews({ category, page: 1 });
  }, []);

  // Function to search news
  const searchForNews = useCallback((query) => {
    fetchNews({ query, page: 1 });
  }, []);

  // Function to change country
  const changeCountry = useCallback((country) => {
    fetchNews({ country, page: 1 });
  }, []);

  // Function to change sort order
  const changeSortBy = useCallback((sortBy) => {
    fetchNews({ sortBy, page: 1 });
  }, []);

  return {
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
    refreshNews: () => fetchNews({ page: 1 }),
  };
};

export default useNews;

