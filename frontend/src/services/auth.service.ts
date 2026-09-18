import axiosInstance, { getApiBaseUrl } from '@/lib/axios';
import type { Session, ApiResponse } from '@/types';

const BASE_URL = getApiBaseUrl();

export const authService = {

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/v1/user/current-user');
    return response.data.user;
  },

  getActiveSessions: async (): Promise<Session[]> => {
    const response = await axiosInstance.get<ApiResponse<{ sessions: Session[] }>>('/api/v1/user/sessions');
    return response.data.data.sessions;
  },

  logoutSession: async (sessionId: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(`/api/v1/user/sessions/${sessionId}/logout`);
    return response.data;
  },

  revokePreAuthSession: async (
    sessionId: string,
    sessionManagementToken: string,
  ): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>(
      `/api/v1/user/session-management/sessions/${sessionId}/logout`,
      {},
      {
        headers: {
          'X-Session-Management-Token': sessionManagementToken,
        },
      },
    );
    return response.data;
  },

  logoutAllDevices: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/api/v1/user/logout-all');
    return response.data;
  },


  loginWithGoogle: () => {
    sessionStorage.setItem('oauth_pending', 'true');
    window.location.href = `${BASE_URL}/api/v1/user/google`;
  },

  verifyGoogleCode: async (code: string) => {
    const response = await axiosInstance.post('/api/v1/user/google/verify', { code });
    return response.data.user;
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

  verifyEmail: async (token: string) => {
    const response = await axiosInstance.get(`/api/v1/user/verify-email/${encodeURIComponent(token)}`);
    return response.data;
  },

  resendEmailVerification: async (email: string) => {
    const response = await axiosInstance.post('/api/v1/user/resend-email-verification', { email });
    return response.data;
  },
};
