import type { LeaderboardEntry } from '$lib/requests/models/LeaderboardEntry.ts';
import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaderboard } from './useLeaderboard.ts';

const { sources } = vi.hoisted(() => ({
  sources: {
    stats: null as unknown,
    user: null as unknown,
  },
}));

vi.mock('$lib/features/query/useQuery.ts', () => ({
  useQuery: () => sources.stats,
}));
vi.mock('$lib/features/auth/stores/useUser.ts', () => ({
  useUser: () => ({ user: sources.user }),
}));
vi.mock('$lib/sections/lists/stores/usePaginatedListQuery.ts', () => ({
  usePaginatedListQuery: () => ({ list: of(ENTRIES), isLoading: of(false) }),
}));

const ENTRIES: LeaderboardEntry[] = [
  {
    key: 'entry-1',
    rank: 1,
    user: { id: 1 } as UserProfile,
    totalMinutes: 300,
    totalPlays: 3,
    locked: false,
    isViewer: false,
  },
  {
    key: 'entry-2',
    rank: 2,
    user: { id: 2 } as UserProfile,
    totalMinutes: 100,
    totalPlays: 1,
    locked: false,
    isViewer: false,
  },
];

const STATS = {
  movies: { minutes: 60, plays: 1 },
  episodes: { minutes: 90, plays: 2 },
};

describe('useLeaderboard', () => {
  beforeEach(() => {
    sources.user = new BehaviorSubject({
      id: 99,
      key: 'user-99',
      isVip: true,
      name: { full: 'Me' },
    });
    sources.stats = new BehaviorSubject({ data: STATS, isFetching: false });
  });

  it('should weave the viewer in by their own minutes', () => {
    const { entries } = useLeaderboard();
    const emissions: ReadonlyArray<LeaderboardEntry>[] = [];
    entries.subscribe((value) => emissions.push(value));

    expect(emissions[0].map((entry) => [entry.key, entry.rank])).toEqual([
      ['entry-1', 1],
      ['leaderboard-viewer', 2],
      ['entry-2', 3],
    ]);
  });

  it('should emit once when only the stats fetch status changes', () => {
    const stats = sources.stats as BehaviorSubject<unknown>;
    const { entries } = useLeaderboard();
    const emissions: unknown[] = [];
    entries.subscribe((value) => emissions.push(value));

    stats.next({ data: STATS, isFetching: true });
    stats.next({ data: STATS, isFetching: false });

    expect(emissions).toHaveLength(1);
  });

  it('should emit again when the stats data changes', () => {
    const stats = sources.stats as BehaviorSubject<unknown>;
    const { entries } = useLeaderboard();
    const emissions: unknown[] = [];
    entries.subscribe((value) => emissions.push(value));

    stats.next({ data: { ...STATS }, isFetching: false });

    expect(emissions).toHaveLength(2);
  });
});
