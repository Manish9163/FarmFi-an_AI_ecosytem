import api from './api';

export const cropService = {
  predict: (data) => api.post('/crop/predict', data),
  history: ()     => api.get('/crop/history'),
};
