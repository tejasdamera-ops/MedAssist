import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("medassist_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.__retried) {
      error.config.__retried = true;
      const refresh = await http.post("/auth/refresh-token");
      const token = refresh.data.data.accessToken;
      localStorage.setItem("medassist_access_token", token);
      error.config.headers.Authorization = `Bearer ${token}`;
      return http(error.config);
    }
    return Promise.reject(error);
  }
);
