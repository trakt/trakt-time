import { describe, expect, it } from 'vitest';
import {
  toUpcomingDateLabel,
  toUpcomingDayLabel,
  toUpcomingRangeLabel,
  toUpcomingWeekdayLabel,
} from './upcomingLabels.ts';

const now = new Date(2026, 8, 26, 15, 0);

describe('toUpcomingDayLabel', () => {
  it('labels today and earlier days as today', () => {
    expect(toUpcomingDayLabel('2026-09-26', 'en', now)).toBe('Today');
    expect(toUpcomingDayLabel('2026-09-25', 'en', now)).toBe('Today');
  });

  it('uses the long weekday within a week', () => {
    expect(toUpcomingDayLabel('2026-09-28', 'en', now)).toBe('Monday');
  });

  it('uses a short date beyond a week', () => {
    expect(toUpcomingDayLabel('2026-10-05', 'en', now)).toBe('Oct 5');
  });
});

describe('toUpcomingWeekdayLabel', () => {
  it('labels today as today and other days with a short weekday', () => {
    expect(toUpcomingWeekdayLabel('2026-09-26', 'en', now)).toBe('Today');
    expect(toUpcomingWeekdayLabel('2026-10-05', 'en', now)).toBe('Mon');
  });
});

describe('toUpcomingDateLabel', () => {
  it('formats a short month and day', () => {
    expect(toUpcomingDateLabel('2026-10-01', 'en')).toBe('Oct 1');
  });
});

describe('toUpcomingRangeLabel', () => {
  it('formats a range across months', () => {
    expect(
      toUpcomingRangeLabel({ start: '2026-09-26', end: '2026-10-02', locale: 'en' }),
    ).toMatch(/^Sep 26\s.\sOct 2$/);
  });
});
