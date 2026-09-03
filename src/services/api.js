import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Files API
export const filesAPI = {
  getAvailableFiles: () => apiClient.get('/files'),
};

// Downloads API
export const downloadsAPI = {
  // Get all downloads
  getAll: () => apiClient.get('/downloads'),

  // Get single download
  getById: (id) => apiClient.get(`/downloads/${id}`),

  // Create new download
  create: (fileId) => apiClient.post('/downloads', { fileId }),

  // Start download
  start: (id) => apiClient.post(`/downloads/${id}/start`),

  // Pause download
  pause: (id) => apiClient.post(`/downloads/${id}/pause`),

  // Resume download
  resume: (id) => apiClient.post(`/downloads/${id}/resume`),

  // Cancel download
  cancel: (id) => apiClient.post(`/downloads/${id}/cancel`),

  // Delete download
  delete: (id) => apiClient.delete(`/downloads/${id}`),

  // Get statistics
  getStats: () => apiClient.get('/downloads/stats/summary')
};

// Health check
export const healthCheck = () => apiClient.get('/health');

export default apiClient;
