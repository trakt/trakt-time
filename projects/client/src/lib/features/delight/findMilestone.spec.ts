import { describe, expect, it } from 'vitest';
import { findMilestone, milestoneBadge } from './findMilestone.ts';

describe('findMilestone', () => {
  const before = { episodes: 999, movies: 42, hours: 700 };

  it('reports the milestone the new counts crossed', () => {
    expect(findMilestone({
      before,
      after: { episodes: 1000, movies: 42, hours: 701 },
    })).toEqual({ kind: 'episodes', threshold: 1000, from: 999, to: 1000 });
  });

  it('covers movies and hours too', () => {
    expect(
      findMilestone({
        before: { episodes: 10, movies: 99, hours: 999 },
        after: { episodes: 10, movies: 100, hours: 999 },
      })?.kind,
    ).toBe('movies');
    expect(
      findMilestone({
        before: { episodes: 10, movies: 3, hours: 999 },
        after: { episodes: 10, movies: 3, hours: 1000 },
      })?.kind,
    ).toBe('hours');
  });

  it('is empty when nothing round was crossed', () => {
    expect(findMilestone({ before, after: before })).toBeNull();
  });
});

describe('milestoneBadge', () => {
  it('shortens thousands', () => {
    expect(milestoneBadge(1000)).toBe('1K');
    expect(milestoneBadge(500)).toBe('500');
  });
});
