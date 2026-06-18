import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Variables to hold the refresh state and the queue of requests waiting for the new token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.request.use((config) => config, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRequest =
            originalRequest.url?.includes('login') ||
            originalRequest.url?.includes('register') ||
            originalRequest.url?.includes('refresh-token');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            // If we are already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Perform only ONE refresh token request
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/api/v1/user/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                
                processQueue(null); // Resolve all queued requests
                isRefreshing = false;
                
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null); // Reject all queued requests
                isRefreshing = false;
                
                // Clear authentication and redirect
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;

