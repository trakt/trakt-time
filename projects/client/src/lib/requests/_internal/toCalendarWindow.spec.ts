import { describe, expect, it } from 'vitest';
import {
  CALENDAR_WINDOW_COUNT,
  toCalendarPageMeta,
  toCalendarWindowStart,
} from './toCalendarWindow.ts';

describe('toCalendarWindowStart', () => {
  it('starts the first page on the start date', () => {
    expect(toCalendarWindowStart({ startDate: '2026-09-24' })).toBe(
      '2026-09-24',
    );
  });

  it('moves each later page forward by one window, across months and years', () => {
    expect(toCalendarWindowStart({ startDate: '2026-09-24', page: 2 })).toBe(
      '2026-10-24',
    );
    expect(toCalendarWindowStart({ startDate: '2026-12-20', page: 2 })).toBe(
      '2027-01-19',
    );
  });
});

describe('toCalendarPageMeta', () => {
  it('pages through a fixed number of windows', () => {
    expect(toCalendarPageMeta(3)).toEqual({
      type: 'paginated',
      current: 3,
      total: CALENDAR_WINDOW_COUNT,
    });
  });
});
