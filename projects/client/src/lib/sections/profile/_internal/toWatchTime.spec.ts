import { describe, expect, it } from 'vitest';
import { toWatchTime } from './toWatchTime.ts';

const DAY = 24 * 60;

describe('toWatchTime', () => {
  it('splits a long watch time into years, months and days', () => {
    expect(toWatchTime(2_401_197)).toEqual([
      { unit: 'year', value: 4 },
      { unit: 'month', value: 6 },
      { unit: 'day', value: 24 },
    ]);
  });

  it('drops units that are zero', () => {
    expect(toWatchTime(365 * DAY + 3 * DAY)).toEqual([
      { unit: 'year', value: 1 },
      { unit: 'day', value: 3 },
    ]);
  });

  it('never shows twelve months', () => {
    expect(toWatchTime(364 * DAY)).toEqual([
      { unit: 'month', value: 11 },
      { unit: 'day', value: 29 },
    ]);
  });

  it('falls back to hours under a day', () => {
    expect(toWatchTime(150)).toEqual([{ unit: 'hour', value: 2 }]);
  });

  it('shows zero hours for no watch time', () => {
    expect(toWatchTime(0)).toEqual([{ unit: 'hour', value: 0 }]);
  });
});
