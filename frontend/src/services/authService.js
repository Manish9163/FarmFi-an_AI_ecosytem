import api from './api';

export const authService = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  verifyOtp:(data)   => api.post('/auth/verify-otp', data),
  resendOtp:(data)   => api.post('/auth/resend-otp', data),
  profile:  ()       => api.get('/auth/profile'),
  me:       ()       => api.get('/auth/me'),
};
