import {
  MEDIA_COVER_LARGE_PLACEHOLDER,
  MEDIA_COVER_THUMB_PLACEHOLDER,
  MEDIA_POSTER_PLACEHOLDER,
} from '$lib/utils/assets.ts';
import { MAX_DATE } from '$lib/utils/constants.ts';
import type { ShowResponse } from '@trakt/api';
import { describe, expect, it } from 'vitest';
import { mapToShowEntry } from './mapToShowEntry.ts';

const minimalShow: ShowResponse = {
  title: 'The Wire',
  ids: {
    trakt: 1438,
    slug: 'the-wire',
  },
};

const fullShow: ShowResponse = {
  ...minimalShow,
  year: 2002,
  ids: {
    trakt: 1438,
    slug: 'the-wire',
    imdb: 'tt0306414',
    tmdb: 1438,
  },
  images: {
    fanart: ['walter.trakt.tv/images/fanart/original/abc.jpg'],
    poster: ['walter.trakt.tv/images/posters/thumb/def.jpg'],
    logo: [],
    clearart: [],
    banner: [],
    thumb: ['walter.trakt.tv/images/thumbs/thumb/ghi.jpg'],
  },
  first_aired: '2002-06-02T00:00:00.000Z',
  runtime: 60,
  aired_episodes: 60,
  overview: 'Baltimore, through its institutions.',
  tagline: 'Listen carefully.',
  status: 'ended',
  rating: 9.5,
  votes: 1234,
  trailer: 'https://youtube.com/watch?v=9qK-VGjMr8g',
  homepage: 'www.hbo.com/the-wire',
  genres: ['drama'],
  airs: { day: 'Sunday', time: '21:00', timezone: 'America/New_York' },
  social_ids: {
    twitter: 'TheWireHBO',
    instagram: null,
    wikipedia: 'The_Wire',
  },
  colors: { poster: ['#111111', '#222222'] },
};

describe('mapToShowEntry', () => {
  it('maps identity fields', () => {
    const entry = mapToShowEntry(fullShow);

    expect(entry.id).toBe(1438);
    expect(entry.key).toBe('show-1438');
    expect(entry.slug).toBe('the-wire');
    expect(entry.type).toBe('show');
    expect(entry.title).toBe('The Wire');
    expect(entry.imdbId).toBe('tt0306414');
    expect(entry.tmdbId).toBe(1438);
    expect(entry.year).toBe(2002);
  });

  it('maps extended fields', () => {
    const entry = mapToShowEntry(fullShow);

    expect(entry.runtime).toBe(60);
    expect(entry.tagline).toBe('Listen carefully.');
    expect(entry.status).toBe('ended');
    expect(entry.genres).toEqual(['drama']);
    expect(entry.votes).toBe(1234);
    expect(entry.rating).toBe(0.95);
    expect(entry.episode.count).toBe(60);
    expect(entry.airs).toEqual({
      day: 'Sunday',
      time: '21:00',
      timezone: 'America/New_York',
    });
    expect(entry.homepage).toBe('https://www.hbo.com/the-wire');
    expect(entry.trailer).toBe('https://youtube.com/watch?v=9qK-VGjMr8g');
    expect(entry.socialMedia).toEqual({
      x: 'TheWireHBO',
      instagram: null,
      facebook: undefined,
      wikipedia: 'The_Wire',
    });
    expect(entry.colors).toEqual(['#111111', '#222222']);
  });

  it('uses the first aired date for all release dates', () => {
    const entry = mapToShowEntry(fullShow);
    const firstAired = new Date('2002-06-02T00:00:00.000Z');

    expect(entry.airDate).toEqual(firstAired);
    expect(entry.releaseDate).toEqual(firstAired);
    expect(entry.effectiveReleaseDate).toEqual(firstAired);
  });

  it('maps image candidates to https urls', () => {
    const entry = mapToShowEntry(fullShow);

    expect(entry.poster.url.thumb).toBe(
      'https://walter.trakt.tv/images/posters/thumb/def.jpg',
    );
    expect(entry.poster.url.medium).toBe(
      'https://walter.trakt.tv/images/posters/medium/def.jpg',
    );
    expect(entry.cover.url.medium).toBe(
      'https://walter.trakt.tv/images/fanart/medium/abc.jpg',
    );
    expect(entry.thumb.url).toBe(
      'https://walter.trakt.tv/images/thumbs/thumb/ghi.jpg',
    );
  });

  it('derives the total runtime from runtime and episode count', () => {
    expect(mapToShowEntry(fullShow).totalRuntime).toBe(3600);
    expect(mapToShowEntry({ ...fullShow, total_runtime: 3400 }).totalRuntime)
      .toBe(3400);
  });

  it('fills defaults for a minimal response', () => {
    const entry = mapToShowEntry(minimalShow);

    expect(entry.runtime).toBeNaN();
    expect(entry.episode.count).toBeNaN();
    expect(entry.totalRuntime).toBeNaN();
    expect(entry.tagline).toBe('');
    expect(entry.genres).toEqual([]);
    expect(entry.status).toBe('unknown');
    expect(entry.overview).toBe('TBD');
    expect(entry.votes).toBe(0);
    expect(entry.rating).toBeUndefined();
    expect(entry.trailer).toBeUndefined();
    expect(entry.airs).toBeUndefined();
    expect(entry.socialMedia).toBeUndefined();
    expect(entry.colors).toBeUndefined();
    expect(entry.postCredits).toEqual([]);
    expect(entry.releaseDate).toEqual(MAX_DATE);
    expect(entry.effectiveReleaseDate).toEqual(MAX_DATE);
  });

  it('falls back to placeholder images', () => {
    const entry = mapToShowEntry(minimalShow);

    expect(entry.poster.url.medium).toBe(MEDIA_POSTER_PLACEHOLDER);
    expect(entry.poster.url.thumb).toBe(MEDIA_POSTER_PLACEHOLDER);
    expect(entry.cover.url.medium).toBe(MEDIA_COVER_LARGE_PLACEHOLDER);
    expect(entry.cover.url.thumb).toBe(MEDIA_COVER_THUMB_PLACEHOLDER);
    expect(entry.thumb.url).toBe(MEDIA_COVER_THUMB_PLACEHOLDER);
  });

  it('drops incomplete airs information', () => {
    const entry = mapToShowEntry({
      ...fullShow,
      airs: { day: 'Sunday', time: null, timezone: 'America/New_York' },
    });

    expect(entry.airs).toBeUndefined();
  });

  it('drops trailers without a video id', () => {
    const entry = mapToShowEntry({
      ...fullShow,
      trailer: 'https://youtube.com/watch',
    });

    expect(entry.trailer).toBeUndefined();
  });
});
