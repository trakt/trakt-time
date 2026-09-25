import { describe, expect, it } from 'vitest';
import { toAdjacentEpisodes } from './toAdjacentEpisodes.ts';

const seasons = [
  { number: 0, episodes: { count: 2 } },
  { number: 1, episodes: { count: 9 } },
  { number: 2, episodes: { count: 10 } },
  { number: 3, episodes: { count: 0 } },
];

describe('toAdjacentEpisodes', () => {
  it('steps within a season', () => {
    expect(toAdjacentEpisodes({ current: { season: 1, episode: 4 }, seasons }))
      .toEqual({
        previous: { season: 1, episode: 3 },
        next: { season: 1, episode: 5 },
      });
  });

  it('crosses into the next season after the last episode', () => {
    expect(
      toAdjacentEpisodes({ current: { season: 1, episode: 9 }, seasons }).next,
    ).toEqual({ season: 2, episode: 1 });
  });

  it('crosses back to the last episode of the previous season', () => {
    expect(
      toAdjacentEpisodes({ current: { season: 2, episode: 1 }, seasons })
        .previous,
    ).toEqual({ season: 1, episode: 9 });
  });

  it('stops at the first and last episodes of the show', () => {
    expect(
      toAdjacentEpisodes({ current: { season: 1, episode: 1 }, seasons })
        .previous,
    ).toBeNull();
    expect(
      toAdjacentEpisodes({ current: { season: 2, episode: 10 }, seasons }).next,
    ).toBeNull();
  });

  it('keeps specials apart from the regular seasons', () => {
    expect(toAdjacentEpisodes({ current: { season: 0, episode: 2 }, seasons }))
      .toEqual({ previous: { season: 0, episode: 1 }, next: null });
  });

  it('gives nothing for an unknown season', () => {
    expect(toAdjacentEpisodes({ current: { season: 7, episode: 1 }, seasons }))
      .toEqual({ previous: null, next: null });
  });
});
