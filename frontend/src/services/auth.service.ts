import axiosInstance from '@/lib/axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const authService = {

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/v1/user/current-user');
    return response.data.user;
  },


  loginWithGoogle: () => {
    sessionStorage.setItem('oauth_pending', 'true');
    window.location.href = `${BASE_URL}/api/v1/user/google`;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post('/api/v1/user/forgot-password', { email });
    return response.data;
  },

  validateResetToken: async (token: string) => {
    const response = await axiosInstance.get(`/api/v1/user/reset-password/${token}/validate`);
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axiosInstance.post(`/api/v1/user/reset-password/${token}`, { password });
    return response.data;
  },
};

