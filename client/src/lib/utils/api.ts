import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for large requests
  timeout: 30000, // 30 seconds
  // Increase max content size
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage in client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request:', config.url);
      } else {
        console.log('No auth token found for request:', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout the user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function with types
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    // Log request info without the full payload for large requests
    if (data) {
      const dataSize = JSON.stringify(data).length;
      console.log(`API ${method} request to ${url} with data size: ${(dataSize / 1024).toFixed(2)} KB`);
    } else {
      console.log(`API ${method} request to ${url} without data`);
    }
    
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    
    console.log(`API ${method} response from ${url}:`, response.status);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(`API ${method} error for ${url}:`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'An unknown error occurred'
      );
    }
    console.error(`Non-Axios error in API ${method} request to ${url}:`, error);
    throw error;
  }
}

// Helper functions for common API operations
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      apiRequest('POST', '/auth/login', { email, password }),
    refreshToken: (refreshToken: string) => 
      apiRequest('POST', '/auth/refresh-token', { refreshToken }),
  },
  
  // Sections endpoints
  sections: {
    getAll: (language?: string) => 
      apiRequest('GET', `/sections?language=${language || 'en'}`),
    getById: (id: string, language?: string) => 
      apiRequest('GET', `/sections/${id}?language=${language || 'en'}`),
    create: (data: any) => 
      apiRequest('POST', '/sections', data),
    update: (id: string, data: any) => 
      apiRequest('PUT', `/sections/${id}`, data),
    delete: (id: string) => 
      apiRequest('DELETE', `/sections/${id}`),
  },
  
  // Articles endpoints
  articles: {
    getAll: (language?: string, published?: boolean) => {
      const publishedParam = published !== undefined ? `&published=${published}` : '';
      return apiRequest('GET', `/articles?language=${language || 'en'}${publishedParam}`);
    },
    getById: (id: string, language?: string) => 
      apiRequest('GET', `/articles/${id}?language=${language || 'en'}`),
    getBySlug: async (slug: string, language?: string) => {
      // First get all articles
      const articles = await apiRequest('GET', `/articles?language=${language || 'en'}&published=true`);
      // Find the article with matching slug
      const article = articles.find((article: any) => article.slug === slug);
      if (!article) {
        throw new Error('Article not found');
      }
      // Get the full article by ID
      return apiRequest('GET', `/articles/${article.id}?language=${language || 'en'}`);
    },
    create: (data: any) => 
      apiRequest('POST', '/articles', data),
    update: (id: string, data: any) => 
      apiRequest('PUT', `/articles/${id}`, data),
    delete: (id: string) => 
      apiRequest('DELETE', `/articles/${id}`),
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('POST', '/articles/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
  
  // Contact endpoints
  contact: {
    getInfo: (language?: string) => 
      apiRequest('GET', `/contact/info?language=${language || 'en'}`),
    updateInfo: (data: any) => 
      apiRequest('PUT', '/contact/info', data),
    sendMessage: (data: { name: string; email: string; subject?: string; message: string }) => 
      apiRequest('POST', '/contact/send', data),
  },
};

export default apiService;