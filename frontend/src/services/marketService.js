import api from './api';

export const marketService = {
  getProducts:    (params) => api.get('/marketplace/products', { params }),
  getProduct:     (id)     => api.get(`/marketplace/products/${id}`),
  getCart:        ()       => api.get('/marketplace/cart'),
  updateCart:     (data)   => api.post('/marketplace/cart', data),
  removeFromCart: (id)     => api.delete(`/marketplace/cart/${id}`),
  placeOrder:     (data)   => api.post('/marketplace/orders', data),
  getOrders:      ()       => api.get('/marketplace/orders'),
  getOrder:       (id)     => api.get(`/marketplace/orders/${id}`),
};

export const creditService = {
  getAccount:     ()       => api.get('/credit/account'),
  repay:          (data)   => api.post('/credit/repay', data),
  getTransactions:()       => api.get('/credit/transactions'),
};
