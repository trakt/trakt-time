import type { PersonResponse } from '@trakt/api';
import { describe, expect, it } from 'vitest';
import { mapToPersonSummary } from './mapToPersonSummary.ts';

describe('mapToPersonSummary', () => {
  it('should point biography links at the local routes', () => {
    const response = {
      ids: { trakt: 1, slug: 'tom-hanks', imdb: null },
      name: 'Tom Hanks',
      biography:
        'Known for [Big](https://app.trakt.tv/movies/big-1988) and [Taxi](https://trakt.tv/shows/taxi).',
    } as unknown as PersonResponse;

    expect(mapToPersonSummary(response).biography).toBe(
      'Known for [Big](/movies/big-1988) and [Taxi](/shows/taxi).',
    );
  });

  it('should fall back to an empty biography', () => {
    const response = {
      ids: { trakt: 1, slug: 'tom-hanks', imdb: null },
      name: 'Tom Hanks',
    } as unknown as PersonResponse;

    expect(mapToPersonSummary(response).biography).toBe('');
  });
});
