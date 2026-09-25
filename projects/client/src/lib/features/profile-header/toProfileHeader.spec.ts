import { describe, expect, it } from 'vitest';
import { toProfileHeader } from './toProfileHeader.ts';

describe('toProfileHeader', () => {
  it('keeps the cover choice', () => {
    expect(toProfileHeader('cover')).toBe('cover');
  });

  it('defaults to the poster wall when nothing is stored', () => {
    expect(toProfileHeader(null)).toBe('posters');
  });

  it('falls back to the poster wall for unknown values', () => {
    expect(toProfileHeader('banner')).toBe('posters');
  });
});
