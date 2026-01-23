import axios from "axios";

// ✅ VITE_API_URL use karo (tumhare .env ke according)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔧 Axios Base URL:', `${API_BASE_URL}/api`);

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('❌ API Error:', error.response?.status, error.config?.url);

    // ✅ Handle 401 with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          
          // ✅ Try to refresh the token
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            { refresh: refreshToken },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const { access } = response.data;

          // ✅ Save new access token
          localStorage.setItem("access_token", access);

          console.log('✅ Token refreshed successfully');

          // ✅ Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);

        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // ✅ Refresh failed - logout user
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          
          // Redirect to login
          window.location.href = "/login";
          
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('⚠️ No refresh token found - logging out');
        
        // ✅ No refresh token - logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;