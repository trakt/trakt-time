import { describe, expect, it } from 'vitest';
import { toMonthStats, toScreenTime, type Watch } from './toWatchStats.ts';

const NOW = new Date('2026-09-26T15:00:00');

const watch = (iso: string, runtime = 60): Watch => ({
  watchedAt: new Date(iso),
  runtime,
});

describe('toMonthStats', () => {
  it('counts plays and minutes since the start of the month', () => {
    const stats = toMonthStats({
      now: NOW,
      watches: [
        watch('2026-09-26T10:00:00', 45),
        watch('2026-09-01T00:30:00', 120),
        watch('2026-08-31T23:00:00', 90),
      ],
    });

    expect(stats).toEqual({ plays: 2, minutes: 165 });
  });
});

describe('toScreenTime', () => {
  it('buckets the last seven days, oldest first, ending today', () => {
    const { dailyMinutes, totalMinutes } = toScreenTime({
      now: NOW,
      watches: [
        watch('2026-09-26T09:00:00', 30),
        watch('2026-09-26T20:00:00', 20),
        watch('2026-09-20T12:00:00', 60),
        watch('2026-09-19T12:00:00', 999),
      ],
    });

    expect(dailyMinutes).toEqual([60, 0, 0, 0, 0, 0, 50]);
    expect(totalMinutes).toBe(110);
  });

  it('sums the week before for comparison', () => {
    const { previousMinutes } = toScreenTime({
      now: NOW,
      watches: [
        watch('2026-09-19T12:00:00', 40),
        watch('2026-09-13T12:00:00', 30),
        watch('2026-09-12T12:00:00', 999),
      ],
    });

    expect(previousMinutes).toBe(70);
  });

  it('counts consecutive watched days, allowing today to be empty', () => {
    const watches = [
      watch('2026-09-25T12:00:00'),
      watch('2026-09-24T12:00:00'),
      watch('2026-09-23T22:00:00'),
      watch('2026-09-21T12:00:00'),
    ];

    expect(toScreenTime({ now: NOW, watches }).streak).toBe(3);
    expect(
      toScreenTime({
        now: NOW,
        watches: [watch('2026-09-26T08:00:00'), ...watches],
      })
        .streak,
    ).toBe(4);
    expect(toScreenTime({ now: NOW, watches: [] }).streak).toBe(0);
  });
});
