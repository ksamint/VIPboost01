import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vip-host-auth');
    if (token) {
      try {
        const { accessToken } = JSON.parse(token);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('vip-host-auth');
        if (token) {
          const { refreshToken } = JSON.parse(token);
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          const newToken = { ...JSON.parse(token), accessToken, refreshToken: newRefreshToken };
          localStorage.setItem('vip-host-auth', JSON.stringify(newToken));

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('vip-host-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
