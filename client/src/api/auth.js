import api from './axios';

export const signup = (data) => api.post('/auth/signup', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
