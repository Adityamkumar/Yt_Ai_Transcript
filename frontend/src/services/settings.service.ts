import axiosInstance from '@/lib/axios';

export type ResponseLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr';

interface UpdatePreferencesResponse {
  data: {
    preferences: {
      responseLanguage: ResponseLanguage;
    };
  };
}

export const settingsService = {
  updateResponseLanguage: async (responseLanguage: ResponseLanguage) => {
    const response = await axiosInstance.patch<UpdatePreferencesResponse>(
      '/api/v1/settings/preferences',
      { responseLanguage },
    );

    return response.data.data.preferences.responseLanguage;
  },
};
