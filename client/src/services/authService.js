import api from './api';

export const register = (payload) => api.post('/auth/register', payload).then(res => res.data);
export const login = (payload) => api.post('/auth/login', payload).then(res => res.data);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};