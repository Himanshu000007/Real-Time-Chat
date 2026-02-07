import api from './axios';

export const getChats = () => api.get('/messages/chats');
export const getMessages = (receiverId) => api.get(`/messages/${receiverId}`);
export const getUsers = () => api.get('/messages/users');
