import { MAX_DATE } from '$lib/utils/constants.ts';
import type { UpNextResponse } from '@trakt/api';
import { describe, expect, it } from 'vitest';
import { mapToEpisodeEntry } from './mapToEpisodeEntry.ts';

type EpisodeResponse = UpNextResponse['progress']['next_episode'];

const minimalEpisode: EpisodeResponse = {
  season: 1,
  number: 1,
  ids: {
    trakt: 73640,
  },
};

const fullEpisode: EpisodeResponse = {
  ...minimalEpisode,
  season: 3,
  number: 11,
  title: 'Middle Ground',
  overview: 'Omar and Brother Mouzone track each other.',
  runtime: 58,
  episode_type: 'standard',
  first_aired: '2004-12-12T02:00:00.000Z',
  released: '2004-12-12',
  effective_release_date: '2004-12-12T02:00:00.000Z',
  rating: 9.2,
  after_credits: false,
  during_credits: true,
  images: {
    screenshot: ['walter.trakt.tv/images/screenshots/original/abc.jpg'],
  },
};

describe('mapToEpisodeEntry', () => {
  it('maps identity fields', () => {
    const entry = mapToEpisodeEntry(fullEpisode);

    expect(entry.id).toBe(73640);
    expect(entry.key).toBe('episode-73640');
    expect(entry.season).toBe(3);
    expect(entry.number).toBe(11);
    expect(entry.title).toBe('Middle Ground');
    expect(entry.type).toBe('standard');
  });

  it('maps extended fields', () => {
    const entry = mapToEpisodeEntry(fullEpisode);

    expect(entry.runtime).toBe(58);
    expect(entry.rating).toBe(0.92);
    expect(entry.postCredits).toEqual(['during']);
    expect(entry.genres).toEqual([]);
  });

  it('maps the release dates and derives the year', () => {
    const entry = mapToEpisodeEntry(fullEpisode);

    expect(entry.airDate).toEqual(new Date('2004-12-12T02:00:00.000Z'));
    expect(entry.releaseDate).toEqual(new Date('2004-12-12'));
    expect(entry.effectiveReleaseDate).toEqual(
      new Date('2004-12-12T02:00:00.000Z'),
    );
    expect(entry.year).toBe(2004);
  });

  it('maps the screenshot to an https thumb cover', () => {
    const entry = mapToEpisodeEntry(fullEpisode);

    expect(entry.cover.url).toBe(
      'https://walter.trakt.tv/images/screenshots/thumb/abc.jpg',
    );
  });

  it('fills defaults for a minimal response', () => {
    const entry = mapToEpisodeEntry(minimalEpisode);

    expect(entry.type).toBe('unknown');
    expect(entry.title).toBe('');
    expect(entry.overview).toBe('');
    expect(entry.runtime).toBeNaN();
    expect(entry.rating).toBeUndefined();
    expect(entry.postCredits).toEqual([]);
    expect(entry.cover.url).toBeUndefined();
    expect(entry.airDate).toEqual(MAX_DATE);
    expect(entry.releaseDate).toEqual(MAX_DATE);
    expect(entry.effectiveReleaseDate).toEqual(MAX_DATE);
    expect(entry.year).toBe(MAX_DATE.getFullYear());
  });
});
