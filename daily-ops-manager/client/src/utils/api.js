import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

export const getTasks = (date) => api.get('/tasks', { params: { date } });
export const getTaskSummary = (date) => api.get('/tasks/summary', { params: { date } });
export const createTask = (data) => api.post('/tasks', data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const resetTasks = () => api.post('/tasks/reset');

export const getSales = (params) => api.get('/sales', { params });
export const getSalesSummary = () => api.get('/sales/summary');
export const addSales = (data) => api.post('/sales', data);
export const deleteSales = (id) => api.delete(`/sales/${id}`);

export const getInventory = (params) => api.get('/inventory', { params });
export const getInventoryAlerts = () => api.get('/inventory/alerts');
export const addInventory = (data) => api.post('/inventory', data);
export const updateStock = (id, data) => api.patch(`/inventory/${id}/stock`, data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

export const getPPC = (params) => api.get('/ppc', { params });
export const getPPCSummary = () => api.get('/ppc/summary');
export const addPPC = (data) => api.post('/ppc', data);
export const updatePPCStatus = (id, status) => api.patch(`/ppc/${id}/status`, { status });
export const deletePPC = (id) => api.delete(`/ppc/${id}`);

export const getReviews = (params) => api.get('/reviews', { params });
export const getReviewSummary = () => api.get('/reviews/summary');
export const addReview = (data) => api.post('/reviews', data);
export const flagReview = (id, data) => api.patch(`/reviews/${id}/flag`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

export const getPnL = (params) => api.get('/pnl', { params });
export const getPnLSummary = () => api.get('/pnl/summary');
export const addPnL = (data) => api.post('/pnl', data);
export const deletePnL = (id) => api.delete(`/pnl/${id}`);

export const getPerformance = (params) => api.get('/performance', { params });
export const getTodayPerformance = () => api.get('/performance/today');
export const savePerformance = () => api.post('/performance/save');
export const getPerformanceTrend = () => api.get('/performance/trend');

export const getAutomationRules = () => api.get('/automation/rules');
export const createAutomationRule = (data) => api.post('/automation/rules', data);
export const toggleRule = (id) => api.patch(`/automation/rules/${id}/toggle`);
export const deleteRule = (id) => api.delete(`/automation/rules/${id}`);
export const getNotifications = () => api.get('/automation/notifications');
export const markNotificationRead = (id) => api.patch(`/automation/notifications/${id}/read`);
export const markAllRead = () => api.post('/automation/notifications/read-all');
export const getUnreadCount = () => api.get('/automation/notifications/unread');

export default api;
