import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('homesync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getSetupStatus: () => api.get('/auth/setup-status'),
  setupAdmin: (data) => api.post('/auth/setup-admin', data),
  getProfile: () => api.get('/auth/me')
};

export const blockAPI = {
  getBlocks: () => api.get('/blocks'),
  createBlock: (data) => api.post('/blocks', data),
  updateBlock: (id, data) => api.put(`/blocks/${id}`, data),
  deleteBlock: (id) => api.delete(`/blocks/${id}`)
};

export const requestAPI = {
  analyze: (description) => api.post('/requests/analyze', { description }),
  create: (data) => api.post('/requests/create', data),
  getRequests: (params) => api.get('/requests', { params }),
  getRequestById: (id) => api.get(`/requests/${id}`),
  updateStatus: (id, status, notes) => api.put(`/requests/${id}/status`, { status, notes }),
  approveAssignment: (id, payload) => api.post(`/requests/${id}/approve-assignment`, payload),
  rateWorker: (id, rating, feedback) => api.post(`/requests/${id}/rate`, { rating, feedback })
};

export const workerAPI = {
  getWorkers: () => api.get('/workers'),
  createWorker: (data) => api.post('/workers', data),
  updateWorker: (id, data) => api.put(`/workers/${id}`, data),
  deleteWorker: (id) => api.delete(`/workers/${id}`),
  updateStatus: (id, availability_status) => api.put(`/workers/${id}/status`, { availability_status })
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all')
};

export const analyticsAPI = {
  getMetrics: () => api.get('/analytics')
};

export default api;
