import api from './api';

export const feedbackService = {
  /**
   * Submit (or update) feedback on a disease prediction.
   * @param {Object} payload
   * @param {number} payload.prediction_id
   * @param {'Correct'|'Incorrect'} payload.feedback_type
   * @param {string} [payload.actual_disease]  — required when feedback_type === 'Incorrect'
   * @param {string} [payload.comment]
   */
  submit: (payload) => api.post('/feedback', payload),

  getHistory: (predictionId) => api.get(`/feedback/history/${predictionId}`),

  getDiseases: () => api.get('/feedback/diseases'),

  getStats: () => api.get('/feedback/stats'),

  exportCSV: () => api.get('/feedback/export', { responseType: 'blob' }),
};
