import '$lib/polyfills/at.ts';
import '$lib/polyfills/toSorted.ts';
import { safeSessionStorage } from '$lib/utils/storage/safeStorage.ts';
import type { HandleClientError } from '@sveltejs/kit';

// FIXME remove once we have custom paraglide handling for this
// Remove PARAGLIDE_LOCALE cookie if it appears multiple times
if (typeof document !== 'undefined') {
  const cookies = document.cookie.split(';');
  const localesCookies = cookies.filter((cookie) => {
    const [name] = cookie.trim().split('=');
    return name === 'PARAGLIDE_LOCALE';
  });

  if (localesCookies.length > 1) {
    // Delete all instances of PARAGLIDE_LOCALE
    document.cookie =
      'PARAGLIDE_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie =
      'PARAGLIDE_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.app.trakt.tv';
    document.cookie =
      'PARAGLIDE_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=app.trakt.tv';
  }
}

const DYNAMIC_IMPORT_RELOAD_KEY = 'dynamic-import-reload';

const DYNAMIC_IMPORT_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Unable to preload CSS for',
];

function isDynamicImportError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return DYNAMIC_IMPORT_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern)
  );
}

function reloadOnceForStaleDeploy(error: unknown): void {
  if (!isDynamicImportError(error)) return;
  if (safeSessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY)) return;

  safeSessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, '1');
  window.location.reload();
}

export const handleError: HandleClientError = ({ error }) => {
  reloadOnceForStaleDeploy(error);
};
