import { time } from '$lib/utils/timing/time.ts';
import { describe, expect, it } from 'vitest';
import { getEpisodeStatus } from './getEpisodeStatus.ts';

const now = new Date('2026-09-24T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - time.days(days));

describe('getEpisodeStatus', () => {
  it('returns premiere for premiere types', () => {
    expect(getEpisodeStatus({ type: 'season_premiere', now })).toBe(
      'premiere',
    );
  });

  it('returns finale for finale types', () => {
    expect(getEpisodeStatus({ type: 'series_finale', now })).toBe('finale');
  });

  it('prefers premiere over new for recent premieres', () => {
    expect(
      getEpisodeStatus({
        type: 'series_premiere',
        releaseDate: daysAgo(1),
        now,
      }),
    ).toBe('premiere');
  });

  it('returns new for episodes released within the last 7 days', () => {
    expect(
      getEpisodeStatus({ type: 'standard', releaseDate: daysAgo(3), now }),
    ).toBe('new');
    expect(
      getEpisodeStatus({ type: 'standard', releaseDate: daysAgo(7), now }),
    ).toBe('new');
  });

  it('returns nothing for older or future episodes', () => {
    expect(
      getEpisodeStatus({ type: 'standard', releaseDate: daysAgo(10), now }),
    ).toBeUndefined();
    expect(
      getEpisodeStatus({ type: 'standard', releaseDate: daysAgo(-1), now }),
    ).toBeUndefined();
  });

  it('returns nothing for standard episodes without a release date', () => {
    expect(getEpisodeStatus({ type: 'standard', now })).toBeUndefined();
  });
});
