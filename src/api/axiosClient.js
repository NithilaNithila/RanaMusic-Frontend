import axios from "axios";

export const API_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;

// Static deploys can't reach localhost; when no VITE_API_BASE_URL is set and
// the page isn't served from a dev host, assume a same-origin /api reverse
// proxy (the recommended Render/Netlify setup).
const detectDefaultBase = () => {
  const host = globalThis.location?.hostname;
  if (host && !/^(localhost|127\.0\.0\.1)$/.test(host)) return "/api";
  return "http://localhost:5000/api";
};

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || detectDefaultBase(),
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => {
    if (res.data && res.data.success === true) {
      res.data = res.data.data;
    }
    return res;
  },
  async (err) => {
    if (err.response?.status === 401) {
      // A 401 from /auth/login or /auth/register means "bad credentials" for
      // THIS attempt — that must NOT evict an existing, still-valid session.
      const url = err.config?.url || "";
      const isAuthAttempt = /\/auth\/(login|register)$/.test(url);
      if (!isAuthAttempt) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
      }
      return Promise.reject(err);
    }

    // Retry idempotent GETs on transient failures (network blips, timeouts,
    // 5xx / 429). Writes (POST/PUT/DELETE) are never retried automatically.
    const { config: cfg, response } = err;
    const method = (cfg?.method || "get").toLowerCase();
    const shouldRetry =
      cfg &&
      !cfg._retried &&
      method === "get" &&
      (!response || response.status >= 500 || response.status === 429);

    if (shouldRetry) {
      cfg._retried = (cfg._retried || 0) + 1;
      if (cfg._retried <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * cfg._retried));
        return axiosClient(cfg);
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
