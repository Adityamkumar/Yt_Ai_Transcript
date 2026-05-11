import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use((config) => config, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = originalRequest.url ?. includes('login') || originalRequest.url ?. includes('register') || originalRequest.url ?. includes('refresh-token') || originalRequest.url ?. includes('current-user');

    if (error.response ?. status === 401 && ! originalRequest._retry && ! isAuthRequest) {
        originalRequest._retry = true;

        try {
            await axios.post(`${
                axiosInstance.defaults.baseURL
            }/api/v1/user/refresh-token`, {}, {withCredentials: true});
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }

    const message = error.response ?. data ?. message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
});

export default axiosInstance;
