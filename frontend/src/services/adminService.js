import api from './api';

export const adminService = {
  dashboard:         ()         => api.get('/admin/dashboard'),
  getDashboard:      ()         => api.get('/admin/dashboard'),
  getUsers:          ()         => api.get('/admin/users'),
  toggleUser:        (id)       => api.patch(`/admin/users/${id}/toggle`),
  getOrders:         ()         => api.get('/admin/orders'),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),

  // Farmers
  getCustomers:      ()         => api.get('/admin/customers'),
  createCustomer:    (data)     => api.post('/admin/customers', data),
  updateCustomer:    (id, data) => api.put(`/admin/customers/${id}`, data),
  deleteCustomer:    (id)       => api.delete(`/admin/customers/${id}`),

  // Workers
  getWorkers:        ()         => api.get('/admin/workers'),
  createWorker:      (data)     => api.post('/admin/workers', data),
  updateWorker:      (id, data) => api.put(`/admin/workers/${id}`, data),
  deleteWorker:      (id)       => api.delete(`/admin/workers/${id}`),

  // Products
  getProducts:       ()         => api.get('/admin/products'),
  createProduct:     (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct:     (id, formData) => api.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct:     (id)       => api.delete(`/admin/products/${id}`),

  // Analytics
  getUserGrowth:     () => api.get('/admin/analytics/user-growth'),
  getDiseaseDistribution: () => api.get('/admin/analytics/disease-distribution'),
  getModelStats:     () => api.get('/feedback/stats'),
  getCropRecommendations: () => api.get('/admin/analytics/crop-recommendations'),
  getProductSales:   () => api.get('/admin/analytics/product-sales'),
  getFeedbackTrend:  () => api.get('/admin/analytics/feedback-trend'),
};
