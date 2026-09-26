import { toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';

export type Watch = {
  watchedAt: Date;
  runtime: number;
};

export type MonthStats = {
  plays: number;
  minutes: number;
};

export type ScreenTime = {
  dailyMinutes: ReadonlyArray<number>;
  totalMinutes: number;
  previousMinutes: number;
  streak: number;
};

const WEEK_IN_DAYS = 7;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysBefore = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);

const sumMinutes = (watches: ReadonlyArray<Watch>) =>
  watches.reduce((total, watch) => total + watch.runtime, 0);

const isBetween = (watch: Watch, start: Date, end: Date) =>
  watch.watchedAt >= start && watch.watchedAt < end;

export function toMonthStats(
  { watches, now }: { watches: ReadonlyArray<Watch>; now: Date },
): MonthStats {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const inMonth = watches.filter((watch) => watch.watchedAt >= monthStart);

  return { plays: inMonth.length, minutes: sumMinutes(inMonth) };
}

function toStreak(
  { watches, now }: { watches: ReadonlyArray<Watch>; now: Date },
): number {
  const watchedDays = new Set(
    watches.map((watch) => toLocalDayKey(watch.watchedAt)),
  );
  const today = startOfDay(now);
  const firstDay = watchedDays.has(toLocalDayKey(today))
    ? today
    : daysBefore(today, 1);

  const countFrom = (offset: number): number =>
    watchedDays.has(toLocalDayKey(daysBefore(firstDay, offset)))
      ? countFrom(offset + 1)
      : offset;

  return countFrom(0);
}

export function toScreenTime(
  { watches, now }: { watches: ReadonlyArray<Watch>; now: Date },
): ScreenTime {
  const tomorrow = daysBefore(startOfDay(now), -1);
  const weekStart = daysBefore(tomorrow, WEEK_IN_DAYS);
  const previousWeekStart = daysBefore(weekStart, WEEK_IN_DAYS);

  const dailyMinutes = Array.from({ length: WEEK_IN_DAYS }, (_, index) => {
    const dayStart = daysBefore(weekStart, -index);
    const dayEnd = daysBefore(dayStart, -1);
    return sumMinutes(
      watches.filter((watch) => isBetween(watch, dayStart, dayEnd)),
    );
  });

  return {
    dailyMinutes,
    totalMinutes: dailyMinutes.reduce((total, minutes) => total + minutes, 0),
    previousMinutes: sumMinutes(
      watches.filter((watch) => isBetween(watch, previousWeekStart, weekStart)),
    ),
    streak: toStreak({ watches, now }),
  };
}
