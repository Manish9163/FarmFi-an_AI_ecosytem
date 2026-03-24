import api from './api';

export const weatherService = {
  getByLocation: (location)       => api.get('/weather', { params: { location } }),
  getByCoords:   (lat, lon)        => api.get('/weather', { params: { lat, lon  } }),
  getLogs:       ()                => api.get('/weather/logs'),
};

export const riskService = {
  predict: (data) => api.post('/risk/predict', data),
  history: ()     => api.get('/risk/history'),
};
