import axiosInstance from './axios';

export const authAPI = {
    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login/', credentials);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get('/auth/me/');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    setTokens: (tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    },
};  