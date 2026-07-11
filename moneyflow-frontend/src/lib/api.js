const PRODUCTION_API_URL = "https://moneyflow-backend-hyh8.onrender.com";
const LOCAL_API_URL = "http://localhost:5000";

/** Backend base URL — Vite env at build time, with Render production fallback */
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL)
).replace(/\/$/, "");
