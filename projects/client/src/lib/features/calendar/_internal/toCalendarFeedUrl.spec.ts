import { describe, expect, it } from 'vitest';
import { toCalendarFeedUrl } from './toCalendarFeedUrl.ts';

const base = { origin: 'https://trakt.tv', token: 'abc123' } as const;

describe('util: toCalendarFeedUrl', () => {
  it('should point the shows calendar at the shows feed with the token', () => {
    expect(toCalendarFeedUrl({ ...base, mode: 'show' })).toEqual({
      https: 'https://trakt.tv/calendars/my/shows.ics?slurm=abc123',
      webcal: 'webcal://trakt.tv/calendars/my/shows.ics?slurm=abc123',
    });
  });

  it('should point the movies calendar at the movies feed', () => {
    expect(toCalendarFeedUrl({ ...base, mode: 'movie' }).https).toBe(
      'https://trakt.tv/calendars/my/movies.ics?slurm=abc123',
    );
  });

  it('should encode the token', () => {
    expect(
      toCalendarFeedUrl({ ...base, token: 'a b&c', mode: 'show' }).https,
    ).toBe('https://trakt.tv/calendars/my/shows.ics?slurm=a+b%26c');
  });
});
