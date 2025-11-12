import api from './api';

// Posts
export const fetchPosts = (params) => api.get('/posts', { params }).then(res => res.data);
export const fetchPost = (id) => api.get(`/posts/${id}`).then(res => res.data);
export const createPost = (payload) => api.post('/posts', payload).then(res => res.data);
export const updatePost = (id, payload) => api.put(`/posts/${id}`, payload).then(res => res.data);
export const deletePost = (id) => api.delete(`/posts/${id}`).then(res => res.data);
export const fetchCategories = () => api.get('/categories').then(res => res.data);

// Categories
export const createCategory = (payload) => api.post('/categories', payload).then(res => res.data);

// Auth helpers
export const register = (payload) => api.post('/auth/register', payload).then(res => res.data);
export const login = (payload) => api.post('/auth/login', payload).then(res => res.data);