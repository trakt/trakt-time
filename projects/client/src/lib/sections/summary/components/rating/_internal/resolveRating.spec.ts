import { time } from '$lib/utils/timing/time.ts';
import { describe, expect, it } from 'vitest';
import { RATING_OVERRIDE_TTL } from './RatingOverride.ts';
import { resolveRating } from './resolveRating.ts';

const savedAt = Date.parse('2026-09-27T17:37:16.500Z');
const now = savedAt + time.seconds(5);

const staleServer = {
  rating: 10,
  ratedAt: new Date('2026-09-27T17:32:28.000Z'),
};

describe('resolveRating', () => {
  it('returns the server entry when there is no override', () => {
    expect(resolveRating({ server: staleServer, override: undefined, now }))
      .toBe(staleServer);
  });

  it('prefers a fresh override over a stale server entry', () => {
    expect(
      resolveRating({
        server: staleServer,
        override: { rating: 9, savedAt },
        now,
      }),
    ).toEqual({ rating: 9, ratedAt: new Date(savedAt) });
  });

  it('shows the override when the server has no entry yet', () => {
    expect(
      resolveRating({
        server: undefined,
        override: { rating: 9, savedAt },
        now,
      }),
    ).toEqual({ rating: 9, ratedAt: new Date(savedAt) });
  });

  it('returns the server entry once it catches up', () => {
    const server = {
      rating: 9,
      ratedAt: new Date('2026-09-27T17:37:16.000Z'),
    };

    expect(
      resolveRating({ server, override: { rating: 9, savedAt }, now }),
    ).toBe(server);
  });

  it('falls back to the server entry when the override expired', () => {
    expect(
      resolveRating({
        server: staleServer,
        override: { rating: 9, savedAt },
        now: savedAt + RATING_OVERRIDE_TTL,
      }),
    ).toBe(staleServer);
  });

  it('hides a stale server rating after a removal', () => {
    expect(
      resolveRating({
        server: staleServer,
        override: { rating: null, savedAt },
        now,
      }),
    ).toBeUndefined();
  });
});
