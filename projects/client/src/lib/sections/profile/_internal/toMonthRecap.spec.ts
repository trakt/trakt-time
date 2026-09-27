import { describe, expect, it } from 'vitest';
import { toMonthRecap } from './toMonthRecap.ts';

describe('toMonthRecap', () => {
  const now = new Date(2026, 9, 2);
  const watch = (
    day: number,
    showTitle: string | null,
    genres: string[],
    month = 8,
  ) => ({
    watchedAt: new Date(2026, month, day),
    minutes: 50,
    showTitle,
    genres,
  });

  it('sums last month and finds its top show and genre', () => {
    expect(toMonthRecap({
      watches: [
        watch(3, 'Slow Horses', ['thriller', 'drama']),
        watch(4, 'Slow Horses', ['thriller']),
        watch(9, 'Severance', ['science-fiction']),
        watch(12, null, ['thriller']),
      ],
      now,
    })).toEqual({
      month: new Date(2026, 8, 1),
      minutes: 200,
      topShow: 'Slow Horses',
      topGenre: 'thriller',
    });
  });

  it('leaves out this month and older months', () => {
    const recap = toMonthRecap({
      watches: [watch(1, 'Andor', ['drama'], 9), watch(30, 'Dark', [], 7)],
      now,
    });

    expect(recap).toEqual({
      month: new Date(2026, 8, 1),
      minutes: 0,
      topShow: null,
      topGenre: null,
    });
  });
});
