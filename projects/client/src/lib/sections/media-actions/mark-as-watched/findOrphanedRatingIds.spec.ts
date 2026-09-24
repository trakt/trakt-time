import type { UserRatings } from '$lib/features/auth/queries/currentUserRatingsQuery.ts';
import type { UserHistory } from '$lib/features/auth/stores/useCurrentUserHistory.ts';
import { describe, expect, it } from 'vitest';
import { findOrphanedRatingIds } from './findOrphanedRatingIds.ts';

const DATE = new Date('2026-01-01T00:00:00.000Z');

const rated = (id: number) => [id, { id, rating: 8, ratedAt: DATE }] as const;

const ratings: UserRatings = {
  movies: new Map([rated(1), rated(2)]),
  shows: new Map([rated(10)]),
  episodes: new Map([rated(100), rated(101)]),
};

const history = {
  movies: new Map([[1, { id: 1, watchedAt: DATE, plays: 2 }]]),
  shows: new Map([[10, {
    id: 10,
    watchedAt: DATE,
    watchedDates: [DATE],
    playsPerSeason: new Map([[1, 1]]),
    episodes: [{
      season: 1,
      episodeId: 100,
      watchedAt: DATE,
      plays: 1,
    }],
  }]]),
} as unknown as UserHistory;

describe('findOrphanedRatingIds', () => {
  it('returns rated movies that are in the history', () => {
    expect(
      findOrphanedRatingIds({
        target: { type: 'movie', media: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        history,
        ratings,
      }),
    ).toEqual([1]);
  });

  it('returns rated shows that are in the history', () => {
    expect(
      findOrphanedRatingIds({
        target: { type: 'show', media: { id: 10 } },
        history,
        ratings,
      }),
    ).toEqual([10]);
  });

  it('returns rated episodes watched within the show', () => {
    expect(
      findOrphanedRatingIds({
        target: {
          type: 'episode',
          media: [
            { id: 100, season: 1, number: 1 },
            { id: 101, season: 1, number: 2 },
          ],
          show: { id: 10, title: 'Show' },
        },
        history,
        ratings,
      }),
    ).toEqual([100]);
  });
});
