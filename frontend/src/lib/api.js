// frontend/src/lib/api.js
// Resolve API base robustly so production never falls back to relative /api on S3/CloudFront.
const resolveApiBase = () => {
  const explicit = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  if (explicit) return explicit;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "www.tixe.dev" || host === "tixe.dev") {
      return "https://api.tixe.dev";
    }
  }

  return "";
};

const API_BASE = resolveApiBase();

// Export the base URL constant for use in fetch calls
export const API_BASE_URL = API_BASE;

// Helper function to build API URL
export const buildApiUrl = (path) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

// Export the base URL for components that need to construct image URLs
export const getApiBaseUrl = () => {
  return API_BASE;
};

// For image URLs, we need the full URL in development
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // In development, use localhost:4000 for static files (images)
  const baseUrl = API_BASE || 'http://localhost:4000';
  return `${baseUrl}${path}`;
};

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // <-- send/receive httpOnly cookie
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    // If session expired (401), clear stale role and redirect to auth page
    if (res.status === 401) {
      // Avoid redirect loops — only redirect if we're on a protected page
      const isProtectedPage = window.location.pathname.startsWith("/client") ||
        window.location.pathname.startsWith("/freelancer");
      if (isProtectedPage) {
        localStorage.removeItem("role");
        window.location.href = "/auth";
        return; // stop execution
      }
    }
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  post: (path, body) => request(path, { method: "POST", body }),
  get: (path) => request(path, { method: "GET" }),
  put: (path, body) => request(path, { method: "PUT", body }),
};
