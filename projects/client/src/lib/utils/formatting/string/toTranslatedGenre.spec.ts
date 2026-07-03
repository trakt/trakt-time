import { describe, expect, it } from 'vitest';
import { toTranslatedGenre } from './toTranslatedGenre.ts';

describe('toTranslatedGenre', () => {
  it('translates a known genre key', () => {
    expect(toTranslatedGenre('horror')).toBe('Horror');
    expect(toTranslatedGenre('science_fiction')).toBe('Science Fiction');
  });

  it('normalizes hyphenated genre slugs', () => {
    expect(toTranslatedGenre('science-fiction')).toBe('Science Fiction');
    expect(toTranslatedGenre('game-show')).toBe('Game Show');
  });

  it('normalizes casing and spaces', () => {
    expect(toTranslatedGenre('Game Show')).toBe('Game Show');
    expect(toTranslatedGenre('HORROR')).toBe('Horror');
  });

  it('returns the input verbatim for unknown genres', () => {
    expect(toTranslatedGenre('zombie-apocalypse')).toBe('zombie-apocalypse');
    expect(toTranslatedGenre('')).toBe('');
  });
});
