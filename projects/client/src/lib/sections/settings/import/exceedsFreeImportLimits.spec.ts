import type { UserLimits } from '$lib/requests/models/UserLimits.ts';
import { describe, expect, it } from 'vitest';
import { exceedsFreeImportLimits } from './exceedsFreeImportLimits.ts';

const limit = (free: number) => ({ current: 0, free, vip: free * 10 });

const limits = {
  history: limit(100),
  ratings: limit(100),
  watchlistItems: limit(50),
  totalListItems: limit(20),
  staticLists: limit(2),
  dynamicLists: limit(2),
  digitalLibrary: limit(100),
  totalNotes: limit(100),
} satisfies UserLimits;

const counts = { history: 10, watchlist: 10, ratings: 500, list: 10 };

describe('exceedsFreeImportLimits', () => {
  it('stays within limits when every count fits', () => {
    expect(exceedsFreeImportLimits({ counts, limits })).toBe(false);
  });

  it('flags any capped action over its free limit', () => {
    expect(
      exceedsFreeImportLimits({ counts: { ...counts, history: 101 }, limits }),
    ).toBe(true);
    expect(
      exceedsFreeImportLimits({ counts: { ...counts, watchlist: 51 }, limits }),
    ).toBe(true);
    expect(
      exceedsFreeImportLimits({ counts: { ...counts, list: 21 }, limits }),
    ).toBe(true);
  });
});
