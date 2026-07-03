import { MEDIA_POSTER_PLACEHOLDER } from '$lib/utils/assets.ts';
import { MAX_DATE } from '$lib/utils/constants.ts';
import type { MovieResponse } from '@trakt/api';
import { describe, expect, it } from 'vitest';
import { mapToMovieEntry } from './mapToMovieEntry.ts';

const minimalMovie: MovieResponse = {
  title: 'Heat',
  ids: {
    trakt: 1204,
    slug: 'heat-1995',
  },
};

const fullMovie: MovieResponse = {
  ...minimalMovie,
  year: 1995,
  ids: {
    trakt: 1204,
    slug: 'heat-1995',
    imdb: 'tt0113277',
    tmdb: 949,
  },
  images: {
    fanart: ['walter.trakt.tv/images/fanart/original/abc.jpg'],
    poster: ['walter.trakt.tv/images/posters/thumb/def.jpg'],
    logo: [],
    clearart: [],
    banner: [],
    thumb: [],
  },
  released: '1995-12-15',
  runtime: 170,
  overview: 'A group of professional bank robbers.',
  tagline: 'A Los Angeles crime saga.',
  status: 'released',
  rating: 8.4,
  votes: 4321,
  certification: 'R',
  after_credits: true,
  during_credits: false,
  genres: ['crime', 'drama'],
};

describe('mapToMovieEntry', () => {
  it('maps identity fields', () => {
    const entry = mapToMovieEntry(fullMovie);

    expect(entry.id).toBe(1204);
    expect(entry.key).toBe('movie-1204');
    expect(entry.slug).toBe('heat-1995');
    expect(entry.type).toBe('movie');
    expect(entry.title).toBe('Heat');
    expect(entry.imdbId).toBe('tt0113277');
    expect(entry.tmdbId).toBe(949);
    expect(entry.year).toBe(1995);
  });

  it('maps extended fields', () => {
    const entry = mapToMovieEntry(fullMovie);

    expect(entry.runtime).toBe(170);
    expect(entry.tagline).toBe('A Los Angeles crime saga.');
    expect(entry.status).toBe('released');
    expect(entry.genres).toEqual(['crime', 'drama']);
    expect(entry.votes).toBe(4321);
    expect(entry.rating).toBe(0.84);
    expect(entry.certification).toBe('R');
    expect(entry.postCredits).toEqual(['after']);
  });

  it('uses the released date for all release dates', () => {
    const entry = mapToMovieEntry(fullMovie);
    const released = new Date('1995-12-15');

    expect(entry.airDate).toEqual(released);
    expect(entry.releaseDate).toEqual(released);
    expect(entry.effectiveReleaseDate).toEqual(released);
  });

  it('uses the cover thumb as the entry thumb', () => {
    const entry = mapToMovieEntry(fullMovie);

    expect(entry.thumb.url).toBe(
      'https://walter.trakt.tv/images/fanart/thumb/abc.jpg',
    );
    expect(entry.thumb.url).toBe(entry.cover.url.thumb);
  });

  it('fills defaults for a minimal response', () => {
    const entry = mapToMovieEntry(minimalMovie);

    expect(entry.runtime).toBeNaN();
    expect(entry.tagline).toBe('');
    expect(entry.genres).toEqual([]);
    expect(entry.status).toBe('unknown');
    expect(entry.overview).toBe('TBD');
    expect(entry.votes).toBe(0);
    expect(entry.rating).toBeUndefined();
    expect(entry.certification).toBeUndefined();
    expect(entry.postCredits).toEqual([]);
    expect(entry.socialMedia).toBeUndefined();
    expect(entry.releaseDate).toEqual(MAX_DATE);
    expect(entry.poster.url.medium).toBe(MEDIA_POSTER_PLACEHOLDER);
  });

  it('treats the literal undefined certification as missing', () => {
    const entry = mapToMovieEntry({
      ...fullMovie,
      certification: 'undefined',
    });

    expect(entry.certification).toBeUndefined();
  });
});
