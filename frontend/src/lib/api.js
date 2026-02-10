// frontend/src/lib/api.js
// In development, the proxy in package.json handles routing to http://localhost:4000
// In production, REACT_APP_API_URL should be set to the actual API domain
const API_BASE = process.env.REACT_APP_API_URL || "";

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
  // For local development, return empty string (relative URLs will use proxy)
  // For production or when explicitly set, return the full URL
  return process.env.REACT_APP_API_URL || "";
};

// For image URLs, we need the full URL in development
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // In development, use localhost:4000 for static files (images)
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
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
