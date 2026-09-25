import { describe, expect, it } from 'vitest';
import { toCompactAge } from './toCompactAge.ts';

const now = new Date('2026-09-25T12:00:00.000Z');
const ago = (ms: number) => new Date(now.getTime() - ms);
const HOUR = 60 * 60 * 1000;

describe('toCompactAge', () => {
  it('should show minutes for the last hour', () => {
    expect(toCompactAge({ date: ago(5 * 60 * 1000), now, locale: 'en' }))
      .toBe('5m');
  });

  it('should show hours for the last day', () => {
    expect(toCompactAge({ date: ago(3 * HOUR), now, locale: 'en' })).toBe('3h');
  });

  it('should show days for the last week', () => {
    expect(toCompactAge({ date: ago(4 * 24 * HOUR), now, locale: 'en' }))
      .toBe('4d');
  });

  it('should show weeks for the last month', () => {
    expect(toCompactAge({ date: ago(15 * 24 * HOUR), now, locale: 'en' }))
      .toBe('2w');
  });

  it('should show a short date for anything older', () => {
    expect(
      toCompactAge({
        date: new Date('2019-08-21T10:00:00.000Z'),
        now,
        locale: 'en-GB',
      }),
    ).toBe('21 Aug 2019');
  });

  it('should never go below one minute', () => {
    expect(toCompactAge({ date: now, now, locale: 'en' })).toBe('1m');
  });
});
