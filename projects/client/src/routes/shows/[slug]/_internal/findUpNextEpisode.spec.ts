import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import { describe, expect, it } from 'vitest';
import { findUpNextEpisode } from './findUpNextEpisode.ts';

const now = new Date('2026-10-01T12:00:00Z');
const past = new Date('2026-09-01T12:00:00Z');
const future = new Date('2026-11-01T12:00:00Z');

const episode = (id: number, effectiveReleaseDate = past) =>
  ({ id, effectiveReleaseDate }) as EpisodeEntry;

describe('findUpNextEpisode', () => {
  const episodes = [episode(1), episode(2), episode(3), episode(4, future)];

  it('returns nothing when the season is untouched', () => {
    expect(findUpNextEpisode({ episodes, watchedIds: new Set(), now }))
      .toBeUndefined();
  });

  it('returns the first unwatched episode after the furthest watched one', () => {
    expect(findUpNextEpisode({ episodes, watchedIds: new Set([1]), now })?.id)
      .toBe(2);
    expect(findUpNextEpisode({ episodes, watchedIds: new Set([2]), now })?.id)
      .toBe(3);
  });

  it('skips unwatched episodes behind the furthest watched one', () => {
    expect(findUpNextEpisode({ episodes, watchedIds: new Set([1, 3]), now }))
      .toBeUndefined();
    expect(
      findUpNextEpisode({
        episodes: [episode(1), episode(2), episode(3), episode(4)],
        watchedIds: new Set([3]),
        now,
      })?.id,
    ).toBe(4);
  });

  it('returns nothing when the next episode has not aired', () => {
    expect(findUpNextEpisode({ episodes, watchedIds: new Set([3]), now }))
      .toBeUndefined();
  });

  it('returns nothing when the season is complete', () => {
    expect(
      findUpNextEpisode({
        episodes: [episode(1), episode(2)],
        watchedIds: new Set([1, 2]),
        now,
      }),
    ).toBeUndefined();
  });
});
