import { describe, expect, it } from 'vitest';
import {
  countSkippedEpisodes,
  findSkippedEpisodeIds,
} from './findSkippedEpisodes.ts';

const NOW = new Date('2026-01-01T00:00:00.000Z');
const AIRED = new Date('2025-01-01T00:00:00.000Z');
const UNAIRED = new Date('2027-01-01T00:00:00.000Z');

const episode = (id: number, number: number, effectiveReleaseDate = AIRED) => ({
  id,
  number,
  effectiveReleaseDate,
});

const count = (
  props: Partial<Parameters<typeof countSkippedEpisodes>[0]> = {},
) =>
  countSkippedEpisodes({
    target: { season: 2, number: 10 },
    currentSeasonEpisodes: [],
    previousSeasons: [],
    watchedEpisodeIds: new Set(),
    watchedCountBySeason: new Map(),
    now: NOW,
    ...props,
  });

describe('countSkippedEpisodes', () => {
  it('counts nothing when every earlier episode is watched', () => {
    expect(
      count({
        currentSeasonEpisodes: [episode(9, 9), episode(10, 10)],
        watchedEpisodeIds: new Set([9]),
      }),
    ).toBe(0);
  });

  it('counts unwatched aired episodes before the target', () => {
    expect(
      count({
        currentSeasonEpisodes: [
          episode(7, 7),
          episode(8, 8, UNAIRED),
          episode(9, 9),
          episode(10, 10),
          episode(11, 11),
        ],
      }),
    ).toBe(2);
  });

  it('counts gaps left in earlier regular seasons only', () => {
    expect(
      count({
        previousSeasons: [
          { number: 0, episodes: { count: 4 } },
          { number: 1, episodes: { count: 8 } },
          { number: 3, episodes: { count: 8 } },
        ],
        watchedCountBySeason: new Map([[1, 3]]),
      }),
    ).toBe(5);
  });

  it('never reports a negative gap for an over-watched season', () => {
    expect(
      count({
        previousSeasons: [{ number: 1, episodes: { count: 2 } }],
        watchedCountBySeason: new Map([[1, 5]]),
      }),
    ).toBe(0);
  });

  it('ignores specials as a target', () => {
    expect(
      count({
        target: { season: 0, number: 3 },
        currentSeasonEpisodes: [episode(1, 1), episode(2, 2)],
      }),
    ).toBe(0);
  });
});

describe('findSkippedEpisodeIds', () => {
  it('returns unwatched aired episodes before the target across seasons', () => {
    expect(
      findSkippedEpisodeIds({
        target: { season: 2, number: 3 },
        episodesBySeason: new Map([
          [0, [episode(100, 1)]],
          [1, [episode(11, 1), episode(12, 2)]],
          [2, [
            episode(21, 1),
            episode(22, 2, UNAIRED),
            episode(23, 3),
            episode(24, 4),
          ]],
          [3, [episode(31, 1)]],
        ]),
        watchedEpisodeIds: new Set([12]),
        now: NOW,
      }),
    ).toEqual([11, 21]);
  });
});
