import { describe, expect, it } from 'vitest';
import { toSearchParamValue } from './toSearchParamValue.ts';

const options = ['all', 'show', 'movie'] as const;

describe('toSearchParamValue', () => {
  it('returns a known value', () => {
    expect(toSearchParamValue({ value: 'movie', options, fallback: 'all' }))
      .toBe('movie');
  });

  it('falls back on missing or unknown values', () => {
    expect(toSearchParamValue({ value: null, options, fallback: 'all' })).toBe(
      'all',
    );
    expect(toSearchParamValue({ value: 'nope', options, fallback: 'all' }))
      .toBe('all');
  });
});
