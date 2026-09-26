import type { LeaderboardEntry } from '$lib/requests/models/LeaderboardEntry.ts';
import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
import { describe, expect, it } from 'vitest';
import { weaveViewer } from './weaveViewer.ts';

const entry = (
  id: number,
  minutes: number | null,
  locked = false,
): LeaderboardEntry => ({
  key: `entry-${id}`,
  rank: locked ? null : id,
  user: { id } as UserProfile,
  totalMinutes: minutes,
  totalPlays: null,
  locked,
  isViewer: false,
});

const viewer = (minutes: number): LeaderboardEntry => ({
  ...entry(99, minutes),
  rank: null,
  isViewer: true,
});

describe('weaveViewer', () => {
  it('returns the entries untouched without a viewer', () => {
    const entries = [entry(1, 100)];
    expect(weaveViewer(entries, null)).toBe(entries);
  });

  it('slots the viewer by minutes and renumbers ranked rows', () => {
    const woven = weaveViewer([entry(1, 300), entry(2, 100)], viewer(200));

    expect(woven.map(({ user, rank }) => [user.id, rank])).toEqual([
      [1, 1],
      [99, 2],
      [2, 3],
    ]);
  });

  it('keeps locked rows unranked and below the viewer', () => {
    const woven = weaveViewer(
      [entry(1, 300), entry(2, null, true)],
      viewer(10),
    );

    expect(woven.map(({ user, rank }) => [user.id, rank])).toEqual([
      [1, 1],
      [99, 2],
      [2, null],
    ]);
  });

  it('highlights the viewer when already present', () => {
    const woven = weaveViewer([entry(1, 300), entry(99, 50)], viewer(50));

    expect(woven.map(({ isViewer }) => isViewer)).toEqual([false, true]);
  });
});
