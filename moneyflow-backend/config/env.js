function trimUrl(value) {
  return (value ?? "").trim().replace(/\/$/, "");
}

/** Public backend URL (Render sets RENDER_EXTERNAL_URL automatically). */
export function resolvePublicBackendUrl() {
  const renderUrl = trimUrl(process.env.RENDER_EXTERNAL_URL);
  if (renderUrl) return renderUrl;

  const backendUrl = trimUrl(process.env.BACKEND_URL);
  if (backendUrl) return backendUrl;

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

/**
 * Google OAuth callback must match Google Cloud Console exactly.
 * On Render, ignore localhost values copied from local .env files.
 */
export function resolveGoogleCallbackUrl() {
  const publicUrl = resolvePublicBackendUrl();
  const auto = `${publicUrl}/auth/google/callback`;
  const explicit = trimUrl(process.env.GOOGLE_CALLBACK_URL);

  const isLocal =
    !explicit ||
    /localhost|127\.0\.0\.1/i.test(explicit);

  if (process.env.RENDER_EXTERNAL_URL && isLocal) {
    return auto;
  }

  return explicit || auto;
}
