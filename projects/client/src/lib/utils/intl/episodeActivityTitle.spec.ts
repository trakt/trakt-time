import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import { EpisodeComputedType } from '$lib/requests/models/EpisodeType.ts';
import { describe, expect, it } from 'vitest';
import { episodeActivityTitle } from './episodeActivityTitle.ts';

function episode(overrides: Partial<EpisodeEntry>): EpisodeEntry {
  return {
    season: 1,
    number: 1,
    title: 'Pilot',
    type: 'standard',
    ...overrides,
  } as EpisodeEntry;
}

describe('episodeActivityTitle', () => {
  it('labels a full season with the show title', () => {
    const entry = episode({
      type: EpisodeComputedType.full_season,
      season: 2,
    });

    expect(episodeActivityTitle(entry, { title: 'The Wire' })).toBe(
      'Season 2 of The Wire',
    );
  });

  it('labels a full season of specials', () => {
    const entry = episode({
      type: EpisodeComputedType.full_season,
      season: 0,
    });

    expect(episodeActivityTitle(entry)).toBe('Specials');
  });

  it('labels multiple sequential episodes as a range', () => {
    const entry = episode({
      type: EpisodeComputedType.multiple_episodes,
      season: 1,
      episodes: [
        episode({ number: 3 }),
        episode({ number: 4 }),
        episode({ number: 5 }),
      ],
    });

    expect(episodeActivityTitle(entry, { title: 'The Wire' })).toBe(
      'S1 • E3-5 of The Wire',
    );
  });

  it('labels multiple non sequential episodes with a count', () => {
    const entry = episode({
      type: EpisodeComputedType.multiple_episodes,
      season: 1,
      episodes: [episode({ number: 1 }), episode({ number: 8 })],
    });

    expect(episodeActivityTitle(entry, { title: 'The Wire' })).toBe(
      '2 eps. of The Wire',
    );
  });

  it('labels a single episode with the show title', () => {
    const entry = episode({ season: 1, number: 5 });

    expect(episodeActivityTitle(entry, { title: 'The Wire' })).toBe(
      'S1 • E5 - The Wire',
    );
  });

  it('falls back to the episode title without a show', () => {
    const entry = episode({ season: 3, number: 11, title: 'Middle Ground' });

    expect(episodeActivityTitle(entry)).toBe('S3 • E11 - Middle Ground');
  });
});
