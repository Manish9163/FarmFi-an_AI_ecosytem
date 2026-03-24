import api from './api';

export const workerService = {
  list:         (params) => api.get('/workers', { params }),
  register:     (data)   => api.post('/workers/register', data),
  getMyJobs:    ()       => api.get('/workers/jobs'),
  getOpenJobs:  ()       => api.get('/workers/jobs/open'),
  requestJob:   (data)   => api.post('/workers/jobs', data),
  updateStatus: (id, data) => api.patch(`/workers/jobs/${id}/status`, data),
  acceptJob:    (id)     => api.post(`/workers/jobs/${id}/accept`),
};
