import { safeLocalStorage } from '$lib/utils/storage/safeStorage.ts';

const STORAGE_KEY = 'trakt-delight-milestone-baseline';

export type MilestoneCounts = {
  episodes: number;
  movies: number;
  hours: number;
};

export function readMilestoneBaseline(): MilestoneCounts | null {
  try {
    const parsed = JSON.parse(safeLocalStorage.getItem(STORAGE_KEY) ?? 'null');
    return parsed && typeof parsed.episodes === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeMilestoneBaseline(counts: MilestoneCounts) {
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}
