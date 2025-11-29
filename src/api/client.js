import axios from 'axios';

// Prefer explicit environment variable `VITE_API_URL` when deployed.
// Fallback behavior:
// - during development (`import.meta.env.DEV`) default to localhost backend
// - in production, default to a relative `/api` so same-origin deployments work
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

// Control whether axios should send credentials (cookies) with cross-origin requests.
// Set `VITE_API_WITH_CREDENTIALS=true` if you rely on cookie-based auth (Sanctum).
const WITH_CREDENTIALS = import.meta.env.VITE_API_WITH_CREDENTIALS === 'true';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: WITH_CREDENTIALS,
});

// In production, warn if `VITE_API_URL` is not set and client falls back to relative `/api`.
if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    'Warning: `VITE_API_URL` is not set in production. The client will use a relative `/api` base URL which assumes the backend is served on the same origin. If your backend is hosted on a different domain (e.g. a separate Vercel app), set `VITE_API_URL` to the backend API URL.'
  );
  if (WITH_CREDENTIALS) {
    // eslint-disable-next-line no-console
    console.warn('`VITE_API_WITH_CREDENTIALS` is true — ensure backend CORS and Sanctum stateful domains are configured correctly.');
  }
}

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default client;
