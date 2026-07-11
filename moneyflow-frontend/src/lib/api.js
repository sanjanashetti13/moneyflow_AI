export const PRODUCTION_API_URL = "https://moneyflow-backend-hyh8.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";

function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL ?? "").trim();

  // Render/dashboard mistakes: empty, "undefined", or relative paths
  if (raw && raw !== "undefined" && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }

  return import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
}

/** Backend base URL for all API calls and OAuth redirects */
export const API_URL = resolveApiUrl();

/** Always absolute — use for Google OAuth (must hit backend, not frontend) */
export const GOOGLE_AUTH_URL = `${PRODUCTION_API_URL}/auth/google`;
