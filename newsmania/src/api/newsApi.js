import axios from 'axios';

const API_KEY = 'a9158e05172643ff8110d3ff616d4805';
const BASE_URL = 'https://newsapi.org/v2';

// Create axios instance with default config
const newsApi = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

// Get top headlines
export const getTopHeadlines = async (params = {}) => {
  try {
    const response = await newsApi.get('/top-headlines', {
      params: {
        country: params.country || 'us',
        category: params.category || '',
        q: params.query || '',
        pageSize: params.pageSize || 10,
        page: params.page || 1,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    throw error;
  }
};

// Search for news
export const searchNews = async (params = {}) => {
  try {
    const response = await newsApi.get('/everything', {
      params: {
        q: params.query || '',
        sortBy: params.sortBy || 'publishedAt',
        language: params.language || 'en',
        pageSize: params.pageSize || 10,
        page: params.page || 1,
        from: params.from || '',
        to: params.to || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};

// Get news sources
export const getSources = async (params = {}) => {
  try {
    const response = await newsApi.get('/sources', {
      params: {
        category: params.category || '',
        language: params.language || 'en',
        country: params.country || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw error;
  }
};

export default {
  getTopHeadlines,
  searchNews,
  getSources,
};

