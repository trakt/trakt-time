import { describe, expect, it } from 'vitest';
import { toPastDayLabel } from './toPastDayLabel.ts';

const NOW = new Date('2026-09-26T15:00:00');

describe('toPastDayLabel', () => {
  it('names today and yesterday', () => {
    expect(toPastDayLabel('2026-09-26', 'en', NOW)).toBe('Today');
    expect(toPastDayLabel('2026-09-25', 'en', NOW)).toBe('Yesterday');
  });

  it('uses the weekday within the last week', () => {
    expect(toPastDayLabel('2026-09-22', 'en', NOW)).toBe('Tuesday');
  });

  it('uses the date for anything older', () => {
    expect(toPastDayLabel('2026-09-10', 'en', NOW)).toBe('Sep 10');
  });
});
