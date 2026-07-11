/** Live Render backend — update if your service URL changes */
export const PRODUCTION_API_URL = "https://moneyflow-ai-backend.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";

function normalizeBaseUrl(raw) {
  let url = (raw ?? "").trim();
  if (!url || url === "undefined") return null;

  // Fix Render dashboard typos like https://https://example.com
  url = url.replace(/^(https?:\/\/)+/i, "https://");

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url.replace(/\/$/, "");
}

function resolveApiUrl() {
  const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;

  return import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
}

/** Backend base URL for all API calls and OAuth redirects */
export const API_URL = resolveApiUrl();

/** Google OAuth must hit the backend, not the frontend */
export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;
