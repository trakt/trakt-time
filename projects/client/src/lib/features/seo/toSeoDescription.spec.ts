import { describe, expect, it } from 'vitest';
import { toSeoDescription } from './toSeoDescription.ts';

describe('toSeoDescription', () => {
  it('should return short text unchanged', () => {
    expect(toSeoDescription('A short overview.')).toBe('A short overview.');
  });

  it('should collapse whitespace and trim', () => {
    expect(toSeoDescription('  Two\n\nlines   here ')).toBe('Two lines here');
  });

  it('should cut long text at a word boundary with an ellipsis', () => {
    const text = 'word '.repeat(60);
    const result = toSeoDescription(text, 40);

    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toContain('wor…');
  });

  it('should return an empty string for missing text', () => {
    expect(toSeoDescription(null)).toBe('');
    expect(toSeoDescription(undefined)).toBe('');
  });
});
