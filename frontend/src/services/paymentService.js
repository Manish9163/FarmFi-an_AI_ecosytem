import api from './api';

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verify:      (data) => api.post('/payment/verify', data),
};
