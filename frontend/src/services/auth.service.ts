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
};
