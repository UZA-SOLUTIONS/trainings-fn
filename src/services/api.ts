import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "uza_access_token";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Request failed";
    const code = error.response?.data?.error;
    const err = new Error(message) as Error & { code?: string; status?: number };
    err.code = code;
    err.status = error.response?.status;
    return Promise.reject(err);
  },
);

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};
