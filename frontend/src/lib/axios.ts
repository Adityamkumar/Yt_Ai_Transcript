import axios from "axios";

export const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";
export const EMAIL_VERIFICATION_REQUIRED_EVENT =
  "lumora:email-verification-required";

export const notifyEmailVerificationRequired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EMAIL_VERIFICATION_REQUIRED_EVENT));
  }
};

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof window !== "undefined") {
    const currentHostname = window.location.hostname;

    if (
      currentHostname &&
      currentHostname !== "localhost" &&
      currentHostname !== "127.0.0.1"
    ) {
      if (envUrl) {
        try {
          const url = new URL(envUrl);
          if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
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

  return envUrl || "http://localhost:8000";
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  withCredentials: true,
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

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.code;

    if (errorCode === EMAIL_NOT_VERIFIED_CODE) {
      notifyEmailVerificationRequired();
    }

    const isAuthRequest =
      originalRequest.url?.includes("login") ||
      originalRequest.url?.includes("register") ||
      originalRequest.url?.includes("refresh-token");

    const isCurrentUserRequest = originalRequest?.url?.includes(
      "/api/v1/user/current-user",
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
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
          { withCredentials: true },
        );

        processQueue(null);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

       if(!isCurrentUserRequest){
          window.location.href = "/";
       }
        return Promise.reject(refreshError);
      }
    }

    if (errorCode !== EMAIL_NOT_VERIFIED_CODE) {
      console.error("Axios request failed:", error);
    }
    let message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    if (error.code === "ECONNABORTED") {
      message =
        "Request timeout: The upload is taking too long on this network connection.";
    } else if (message === "Network Error") {
      message =
        "Network Error: The backend server is unreachable or CORS blocked the request.";
    }

    const customError = new Error(message) as any;
    customError.status = error.response?.status;
    customError.code = errorCode;
    customError.isEmailVerificationRequired =
      errorCode === EMAIL_NOT_VERIFIED_CODE;
    customError.retryAfter =
      error.response?.data?.retryAfter ??
      error.response?.data?.data?.retryAfter ??
      (error.response?.status === 429 &&
      typeof error.response?.data?.data === "number"
        ? error.response.data.data
        : undefined);
    customError.reason =
      error.response?.data?.reason ?? error.response?.data?.data?.reason;
    return Promise.reject(customError);
  },
);

export default axiosInstance;
