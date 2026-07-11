/** Live Render backend — update if your service URL changes */
export const PRODUCTION_API_URL = "https://moneyflow-ai-backend.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";

/** Old/wrong Render services — never use these in production builds */
const BLOCKED_API_HOSTS = new Set([
  "moneyflow-backend-1.onrender.com",
  "moneyflow-backend-hyh8.onrender.com",
]);

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

function isUsableApiUrl(url) {
  try {
    const host = new URL(url).hostname;
    return !BLOCKED_API_HOSTS.has(host);
  } catch {
    return false;
  }
}

function resolveApiUrl() {
  const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (fromEnv && isUsableApiUrl(fromEnv)) {
    return fromEnv;
  }

  return import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
}

/** Backend base URL for all API calls and OAuth redirects */
export const API_URL = resolveApiUrl();

/** Always use live backend for OAuth — ignores bad Render VITE_API_URL overrides */
export const GOOGLE_AUTH_URL = `${PRODUCTION_API_URL}/auth/google`;
