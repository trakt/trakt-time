import { safeLocalStorage } from '$lib/utils/storage/safeStorage.ts';

const STORAGE_KEY = 'trakt-klipy-customer-id';

let cached: string | undefined;

function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function klipyCustomerId(): string {
  if (cached) {
    return cached;
  }

  const stored = safeLocalStorage.getItem(STORAGE_KEY);

  if (stored) {
    cached = stored;
    return stored;
  }

  const created = createId();
  safeLocalStorage.setItem(STORAGE_KEY, created);
  cached = created;

  return created;
}
