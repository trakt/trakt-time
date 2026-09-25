import { describe, expect, it } from 'vitest';
import { COMPETITORS, findCompetitor } from './competitors.ts';

describe('findCompetitor', () => {
  it('finds a competitor by slug', () => {
    expect(findCompetitor('letterboxd')?.name).toBe('Letterboxd');
  });

  it('returns undefined for an unknown slug', () => {
    expect(findCompetitor('tvtime')).toBeUndefined();
  });

  it('keeps slugs unique', () => {
    const slugs = COMPETITORS.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
