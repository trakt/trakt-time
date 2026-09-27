import { safeLocalStorage } from '$lib/utils/storage/safeStorage.ts';

const STORAGE_KEY = 'trakt-delights-fired';

function readFired(): Set<string> {
  try {
    const parsed = JSON.parse(safeLocalStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function createDelightMemory() {
  const fired = readFired();

  return {
    fired: () => fired as ReadonlySet<string>,
    remember: (key: string) => {
      fired.add(key);
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify([...fired]));
    },
  };
}
