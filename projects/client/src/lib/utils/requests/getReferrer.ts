import { IS_DEV, IS_PREVIEW } from '../env/index.ts';

/*
 * Resolves the origin used as the OAuth `redirect_uri` and similar self-links.
 *
 * In production, we want whatever origin the worker is actually serving on
 * (e.g. `https://trakt-time.<account>.workers.dev` or a custom domain) so the
 * OAuth provider redirects users back to the *deployed* app instead of the
 * upstream `app.trakt.tv`. Falling back to that hard-coded origin only makes
 * sense when there is no `window.location` available (SSR, server hooks).
 */
export function getReferrer() {
  if (IS_DEV) {
    return 'http://localhost:5173';
  }

  if (IS_PREVIEW) {
    return 'http://localhost:4173';
  }

  return globalThis.location?.origin ?? 'https://app.trakt.tv';
}
