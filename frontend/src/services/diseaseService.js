import api from './api';

export const diseaseService = {
  predict:      (formData) => api.post('/disease/predict', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  history:      ()         => api.get('/disease/history'),
  feedback:     (data)     => api.post('/disease/feedback', data),
};
