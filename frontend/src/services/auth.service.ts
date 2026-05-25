import axiosInstance from '@/lib/axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const authService = {
  /**
   * Fetch the currently authenticated user.
   * Relies on the accessToken cookie being sent automatically.
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/v1/user/current-user');
    return response.data.user;
  },

  /**
   * Redirect the browser to the backend Google OAuth initiation URL.
   * Sets a sessionStorage flag so LandingPage can detect the return redirect
   * and automatically call refreshUser() — without firing on every page visit.
   */
  loginWithGoogle: () => {
    sessionStorage.setItem('oauth_pending', 'true');
    window.location.href = `${BASE_URL}/api/v1/user/google`;
  },
};
