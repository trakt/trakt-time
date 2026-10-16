import type { PersonSummary } from '$lib/requests/models/PersonSummary.ts';
import { describe, expect, it } from 'vitest';
import { toPersonSeo } from './toPersonSeo.ts';

describe('toPersonSeo', () => {
  it('should describe the person without markdown links', () => {
    const person = {
      id: 1,
      key: 'person-1',
      slug: 'tom-hanks',
      name: 'Tom Hanks',
      biography: 'Known for [Big](/movies/big-1988) and [Taxi](/shows/taxi).',
      headshot: {
        url: {
          medium: 'https://example.com/a.jpg',
          thumb: 'https://example.com/a.jpg',
        },
      },
    } satisfies PersonSummary;

    const seo = toPersonSeo({ person, url: 'https://example.com/people/tom' });

    expect(seo.description).toBe('Known for Big and Taxi.');
  });
});
