import axios from 'axios';

export const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (typeof window !== 'undefined') {
        const currentHostname = window.location.hostname;
        
        if (currentHostname && currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
            if (envUrl) {
                try {
                    const url = new URL(envUrl);
                    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                        url.hostname = currentHostname;
                        return url.origin;
                    }
                    return envUrl;
                } catch (e) {
                    // ignore
                }
            }
            return `${window.location.protocol}//${currentHostname}:8000`;
        }
    }
    
    return envUrl || 'http://localhost:8000';
};

const axiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


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
                
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/api/v1/user/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                
                processQueue(null); 
                isRefreshing = false;
                
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null); 
                isRefreshing = false;
                
                
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

