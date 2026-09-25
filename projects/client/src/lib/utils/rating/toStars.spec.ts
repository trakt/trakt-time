import { describe, expect, it } from 'vitest';
import {
  formatStars,
  toStarsFromScore,
  toStarsFromUserRating,
} from './toStars.ts';

describe('toStarsFromUserRating', () => {
  it('maps the 1 to 10 scale onto half stars', () => {
    expect(toStarsFromUserRating(10)).toBe(5);
    expect(toStarsFromUserRating(9)).toBe(4.5);
    expect(toStarsFromUserRating(1)).toBe(0.5);
  });
});

describe('toStarsFromScore', () => {
  it('maps the community score onto five stars with one decimal', () => {
    expect(toStarsFromScore(0.87)).toBe(4.4);
    expect(toStarsFromScore(0.842)).toBe(4.2);
    expect(toStarsFromScore(1)).toBe(5);
  });
});

describe('formatStars', () => {
  it('drops a trailing zero and follows the locale', () => {
    expect(formatStars({ value: 4, locale: 'en' })).toBe('4');
    expect(formatStars({ value: 4.5, locale: 'en' })).toBe('4.5');
    expect(formatStars({ value: 4.5, locale: 'de-DE' })).toBe('4,5');
  });
});
