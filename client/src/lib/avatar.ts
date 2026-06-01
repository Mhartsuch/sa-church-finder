/**
 * Resolve a user avatar URL for rendering.
 *
 * Uploaded avatars are stored as paths relative to the API origin
 * (e.g. `/uploads/avatars/user-1.jpg`), so they must be prefixed with the API
 * base URL — the SPA and API are served from different origins. Absolute URLs
 * (e.g. Google OAuth avatars) are returned unchanged. Returns `null` when no
 * avatar is set so callers can fall back to rendering initials.
 */
export const resolveAvatarSrc = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;

  const apiBase = import.meta.env.VITE_API_URL || '';

  return `${apiBase}${avatarUrl}`;
};
