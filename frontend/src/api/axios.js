import axios from "axios";

// ---------------------------------------------------------------------------
// Token store (in-memory — never persisted to localStorage)
// ---------------------------------------------------------------------------

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// ---------------------------------------------------------------------------
// Base URL resolution
// In production (non-localhost), always use the Vercel /api rewrite proxy.
// In development, fall back to VITE_BASE_URL and swap out localhost for the
// current LAN hostname so mobile devices on the same network can reach the
// dev server.
// ---------------------------------------------------------------------------

export const getDynamicBaseURL = () => {
  if (typeof window === "undefined") return import.meta.env.VITE_BASE_URL;

  const hostname = window.location.hostname.toLowerCase();
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");

  if (!isLocal) {
    // Production: rely on Vercel's /api → backend rewrite rule
    return "/api";
  }

  // Development: resolve the env URL, substituting the actual LAN IP/hostname
  // so that mobile test devices on the same Wi-Fi can reach the dev server.
  const envUrl = import.meta.env.VITE_BASE_URL ?? "";
  if (envUrl.includes("localhost")) {
    return envUrl.replace("localhost", window.location.hostname);
  }
  if (envUrl.includes("127.0.0.1")) {
    return envUrl.replace("127.0.0.1", window.location.hostname);
  }
  return envUrl;
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: getDynamicBaseURL(),
  withCredentials: true, // Required for HTTP-only refresh-token cookie
});

// ---------------------------------------------------------------------------
// Request interceptor
// Responsibilities:
//   1. Normalise absolute URLs to relative paths (strips base prefix)
//   2. Scope the path under the correct route (admin/ prefix for admin calls)
//   3. Attach the Bearer access token when present
// ---------------------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config) => {
    let url = config.url;

    // 1. Strip the base URL prefix or parse absolute URLs down to a path
    const base = config.baseURL || getDynamicBaseURL();
    if (url.startsWith(base)) {
      url = url.slice(base.length);
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        const parsed = new URL(url);
        url = parsed.pathname + parsed.search;
        if (url.startsWith("/api")) url = url.slice(4);
      } catch {
        // Malformed URL — leave as-is and let the request fail naturally
      }
    }

    // Strip leading slash for easier prefix checks below
    if (url.startsWith("/")) url = url.slice(1);

    // 2. Prepend admin/ if the user is authenticated (admin mode)
    // and the URL doesn't already start with auth/ or admin/
    const isAuthRoute = url.startsWith("auth");
    const isAlreadyAdmin = url.startsWith("admin");

    if (!isAuthRoute && !isAlreadyAdmin && accessToken) {
      url = `admin/${url}`;
    }

    config.url = "/" + url;

    // 3. Bearer token
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — silent token refresh on 401 / 403
// Uses a queue to prevent parallel refresh requests.
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAdminRoute = originalRequest.url.startsWith("/admin") || originalRequest.url.startsWith("admin");

    const isTokenError =
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      isAdminRoute &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth");

    if (!isTokenError) return Promise.reject(error);

    // If a refresh is already in flight, queue this request until it resolves
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        originalRequest.url = originalRequest.url.replace(/^\/?/, "/");
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return new Promise((resolve, reject) => {
      axios
        .post(
          `${getDynamicBaseURL()}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        )
        .then(({ data }) => {
          const newToken = data.accessToken;
          setAccessToken(newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          originalRequest.url = originalRequest.url.replace(/^\/?/, "/");
          processQueue(null, newToken);
          resolve(axiosInstance(originalRequest));
        })
        .catch((refreshError) => {
          processQueue(refreshError, null);
          accessToken = null;
          localStorage.removeItem("wasLoggedIn");
          window.location.href = "/admin/login";
          reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

export default axiosInstance;
