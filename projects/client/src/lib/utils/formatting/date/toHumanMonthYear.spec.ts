import { describe, expect, it } from 'vitest';
import { toHumanMonthYear } from './toHumanMonthYear.ts';

describe('toHumanMonthYear', () => {
  it('formats the month name and year', () => {
    expect(toHumanMonthYear(new Date(2010, 8, 25), 'en')).toBe(
      'September 2010',
    );
  });

  it('uses the stand-alone month name for the locale', () => {
    expect(toHumanMonthYear(new Date(2010, 8, 25), 'ro-ro')).toBe(
      'septembrie 2010',
    );
  });
});
