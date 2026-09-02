import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://trainings-bn.vercel.app/api";

export const TOKEN_KEY = "uza_access_token";
export const AUTH_EXPIRED_EVENT = "uza:auth-expired";

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
    const status = error.response?.status as number | undefined;
    const message =
      error.response?.data?.message ||
      (error.code === "ERR_NETWORK"
        ? "Cannot reach the API. Check that the backend is running and VITE_API_URL is correct."
        : error.message || "Request failed");
    const code = error.response?.data?.error;

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    const err = new Error(message) as Error & { code?: string; status?: number };
    err.code = code;
    err.status = status;
    return Promise.reject(err);
  },
);

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

/** GET /health — verifies the backend is reachable. */
export async function healthCheck() {
  const { data } = await api.get<ApiResponse<{ status: string }>>("/health");
  return data.data;
}
