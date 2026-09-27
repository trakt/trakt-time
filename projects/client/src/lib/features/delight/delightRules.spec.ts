import { describe, expect, it } from 'vitest';
import {
  activeBinge,
  bingeCount,
  bucketFor,
  isNewSeason,
  latestAiredSeason,
  ratingDelight,
  seasonMilestone,
  shouldFire,
} from './delightRules.ts';

describe('ratingDelight', () => {
  it('celebrates a 10', () => {
    expect(ratingDelight(10)).toBe('rating-high');
  });

  it('reacts to a 1 or a 2', () => {
    expect(ratingDelight(1)).toBe('rating-low');
    expect(ratingDelight(2)).toBe('rating-low');
  });

  it('stays quiet for everything in between and for a cleared rating', () => {
    [0, 3, 5, 6, 9].forEach((rating) => {
      expect(ratingDelight(rating)).toBeNull();
    });
  });
});

describe('shouldFire', () => {
  it('always fires without a once key', () => {
    expect(shouldFire({ fired: new Set(['finale:1']) })).toBe(true);
  });

  it('fires a once key only the first time', () => {
    expect(shouldFire({ onceKey: 'finale:1', fired: new Set() })).toBe(true);
    expect(shouldFire({ onceKey: 'finale:1', fired: new Set(['finale:1']) }))
      .toBe(false);
  });
});

describe('bucketFor', () => {
  const variants = ['tomato', 'rain'] as const;

  it('keeps a user in the same group', () => {
    const first = bucketFor({ seed: 'sean', experiment: 'low', variants });
    const second = bucketFor({ seed: 'sean', experiment: 'low', variants });

    expect(first).toBe(second);
  });

  it('spreads users across every variant', () => {
    const seen = new Set(
      Array.from(
        { length: 200 },
        (_, i) => bucketFor({ seed: `user-${i}`, experiment: 'low', variants }),
      ),
    );

    expect(seen).toEqual(new Set(variants));
  });
});

describe('seasonMilestone', () => {
  const now = new Date('2026-09-27');
  const aired = new Date('2026-01-01');
  const upcoming = new Date('2026-12-01');
  const season = [
    { id: 1, releaseDate: aired },
    { id: 2, releaseDate: aired },
  ];

  it('does nothing while an aired episode is unwatched', () => {
    expect(seasonMilestone({
      episodes: season,
      watchedIds: new Set([1]),
      isLatestAiredSeason: false,
      hasEnded: false,
      now,
    })).toBeNull();
  });

  it('marks an older finished season as complete', () => {
    expect(seasonMilestone({
      episodes: season,
      watchedIds: new Set([1, 2]),
      isLatestAiredSeason: false,
      hasEnded: false,
      now,
    })).toBe('season-complete');
  });

  it('prefers caught up over season complete on a returning show', () => {
    expect(seasonMilestone({
      episodes: season,
      watchedIds: new Set([1, 2]),
      isLatestAiredSeason: true,
      hasEnded: false,
      now,
    })).toBe('caught-up');
  });

  it('is caught up mid-season when every aired episode is watched', () => {
    expect(seasonMilestone({
      episodes: [...season, { id: 3, releaseDate: upcoming }],
      watchedIds: new Set([1, 2]),
      isLatestAiredSeason: true,
      hasEnded: false,
      now,
    })).toBe('caught-up');
  });

  it('never calls a season complete while episodes are still to air', () => {
    expect(seasonMilestone({
      episodes: [...season, { id: 3, releaseDate: upcoming }],
      watchedIds: new Set([1, 2]),
      isLatestAiredSeason: false,
      hasEnded: false,
      now,
    })).toBeNull();
  });

  it('treats the last season of an ended show as complete, not caught up', () => {
    expect(seasonMilestone({
      episodes: season,
      watchedIds: new Set([1, 2]),
      isLatestAiredSeason: true,
      hasEnded: true,
      now,
    })).toBe('season-complete');
  });
});

describe('latestAiredSeason', () => {
  const now = new Date('2026-09-27');

  it('picks the highest season that has started airing, ignoring specials', () => {
    expect(latestAiredSeason({
      seasons: [
        { number: 0, airDate: new Date('2027-01-01') },
        { number: 1, airDate: new Date('2022-02-18') },
        { number: 2, airDate: new Date('2025-01-17') },
        { number: 3, airDate: new Date('2027-01-01') },
      ],
      now,
    })).toBe(2);
  });

  it('is empty before anything airs', () => {
    expect(latestAiredSeason({
      seasons: [{ number: 1, airDate: new Date('2027-01-01') }],
      now,
    })).toBeNull();
  });
});

describe('bingeCount', () => {
  const now = new Date('2026-09-27T22:00:00Z');
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000);

  it('counts every episode watched in the current sitting', () => {
    expect(bingeCount({
      watchedDates: [minutesAgo(5), minutesAgo(55), minutesAgo(110)],
      now,
    })).toBe(3);
  });

  it('stops at the first long break', () => {
    expect(bingeCount({
      watchedDates: [minutesAgo(5), minutesAgo(55), minutesAgo(60 * 24)],
      now,
    })).toBe(2);
  });

  it('is zero once the sitting is over', () => {
    expect(bingeCount({ watchedDates: [minutesAgo(60 * 5)], now })).toBe(0);
  });

  it('is zero without history', () => {
    expect(bingeCount({ watchedDates: [], now })).toBe(0);
  });
});

describe('activeBinge', () => {
  const now = new Date('2026-09-27T22:00:00Z');
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000);

  it('picks the show with the longest current sitting', () => {
    expect(activeBinge({
      shows: [
        { id: 1, watchedDates: [minutesAgo(10)] },
        {
          id: 2,
          watchedDates: [minutesAgo(5), minutesAgo(50), minutesAgo(95)],
        },
      ],
      now,
    })).toEqual({ showId: 2, count: 3 });
  });

  it('is empty when nothing is being watched', () => {
    expect(activeBinge({ shows: [], now })).toBeNull();
  });
});

describe('isNewSeason', () => {
  const now = new Date('2026-09-27');

  it('glows for the first episode of a season that just premiered', () => {
    expect(isNewSeason({
      type: 'season_premiere',
      number: 1,
      releaseDate: new Date('2026-09-20'),
      now,
    })).toBe(true);
  });

  it('ignores old premieres, other episodes and brand new shows', () => {
    expect(isNewSeason({
      type: 'season_premiere',
      number: 1,
      releaseDate: new Date('2026-06-01'),
      now,
    })).toBe(false);
    expect(isNewSeason({
      type: 'standard',
      number: 2,
      releaseDate: new Date('2026-09-20'),
      now,
    })).toBe(false);
    expect(isNewSeason({
      type: 'series_premiere',
      number: 1,
      releaseDate: new Date('2026-09-20'),
      now,
    })).toBe(false);
  });
});
