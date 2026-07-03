import { MEDIA_POSTER_PLACEHOLDER } from '$lib/utils/assets.ts';
import { describe, expect, it } from 'vitest';
import { mapToPoster } from './mapToPoster.ts';

describe('mapToPoster', () => {
  it('maps the first poster candidate to https medium and thumb urls', () => {
    const poster = mapToPoster({
      poster: ['walter.trakt.tv/images/posters/original/abc.jpg'],
    });

    expect(poster.url.medium).toBe(
      'https://walter.trakt.tv/images/posters/medium/abc.jpg',
    );
    expect(poster.url.thumb).toBe(
      'https://walter.trakt.tv/images/posters/thumb/abc.jpg',
    );
  });

  it('skips blank candidates', () => {
    const poster = mapToPoster({
      poster: ['  ', 'walter.trakt.tv/images/posters/thumb/def.jpg'],
    });

    expect(poster.url.thumb).toBe(
      'https://walter.trakt.tv/images/posters/thumb/def.jpg',
    );
    expect(poster.url.medium).toBe(
      'https://walter.trakt.tv/images/posters/medium/def.jpg',
    );
  });

  it('falls back to the placeholder when there are no candidates', () => {
    expect(mapToPoster({ poster: [] }).url).toEqual({
      medium: MEDIA_POSTER_PLACEHOLDER,
      thumb: MEDIA_POSTER_PLACEHOLDER,
    });
  });

  it('falls back to the placeholder for missing images', () => {
    expect(mapToPoster(undefined).url).toEqual({
      medium: MEDIA_POSTER_PLACEHOLDER,
      thumb: MEDIA_POSTER_PLACEHOLDER,
    });
    expect(mapToPoster(null).url).toEqual({
      medium: MEDIA_POSTER_PLACEHOLDER,
      thumb: MEDIA_POSTER_PLACEHOLDER,
    });
  });

  it('keeps already https urls intact', () => {
    const poster = mapToPoster({
      poster: ['https://walter.trakt.tv/images/posters/thumb/abc.jpg'],
    });

    expect(poster.url.thumb).toBe(
      'https://walter.trakt.tv/images/posters/thumb/abc.jpg',
    );
  });
});
