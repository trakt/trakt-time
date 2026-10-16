import { describe, expect, it } from 'vitest';
import { toLocalMarkdownLinks } from './toLocalMarkdownLinks.ts';

describe('toLocalMarkdownLinks', () => {
  it('should point trakt links at the local routes', () => {
    expect(
      toLocalMarkdownLinks(
        '**[Tom Hanks](https://app.trakt.tv/people/tom-hanks)** in [Big](https://trakt.tv/movies/big-1988) and [Taxi](https://www.trakt.tv/shows/taxi).',
      ),
    ).toBe(
      '**[Tom Hanks](/people/tom-hanks)** in [Big](/movies/big-1988) and [Taxi](/shows/taxi).',
    );
  });

  it('should keep only the label for trakt links without a local route', () => {
    expect(
      toLocalMarkdownLinks(
        '[Season 1](https://trakt.tv/shows/taxi/seasons/1) and [Lists](https://trakt.tv/lists/popular).',
      ),
    ).toBe('Season 1 and Lists.');
  });

  it('should leave relative links and other origins unchanged', () => {
    const text =
      '[Big](/movies/big-1988) and [IMDb](https://www.imdb.com/title/tt0094737)';

    expect(toLocalMarkdownLinks(text)).toBe(text);
  });

  it('should leave the trakt origin in plain text unchanged', () => {
    const text = 'Visit https://trakt.tv/people/tom-hanks for more.';

    expect(toLocalMarkdownLinks(text)).toBe(text);
  });
});
