import { describe, expect, it } from 'vitest';
import { capitalizeFirst } from './capitalizeFirst.ts';

describe('capitalizeFirst', () => {
  it('should uppercase only the first letter', () => {
    expect(capitalizeFirst('vendredi 3', 'fr')).toBe('Vendredi 3');
  });

  it('should leave already capitalized text unchanged', () => {
    expect(capitalizeFirst('Friday', 'en')).toBe('Friday');
  });

  it('should respect locale casing rules', () => {
    expect(capitalizeFirst('istanbul', 'tr')).toBe('İstanbul');
  });

  it('should handle empty strings', () => {
    expect(capitalizeFirst('', 'en')).toBe('');
  });
});
