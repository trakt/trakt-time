import { daysFromToday, toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';

const DAYS_PER_WEEK = 7;

export type UpcomingDay<T> = {
  key: string;
  offset: number;
  items: ReadonlyArray<T>;
};

export type UpcomingWeek<T> = {
  index: number;
  days: ReadonlyArray<UpcomingDay<T>>;
};

type ToUpcomingWeeksParams<T> = {
  items: ReadonlyArray<T>;
  toDayKey: (item: T) => string;
  today: Date;
};

const toDayKeyAtOffset = (today: Date, offset: number) =>
  toLocalDayKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset),
  );

export function toUpcomingWeeks<T>(
  { items, toDayKey, today }: ToUpcomingWeeksParams<T>,
): UpcomingWeek<T>[] {
  if (items.length === 0) return [];

  const byOffset = items.reduce((acc, item) => {
    const offset = Math.max(0, daysFromToday(toDayKey(item), today));
    acc.set(offset, [...(acc.get(offset) ?? []), item]);
    return acc;
  }, new Map<number, T[]>());

  const lastOffset = Math.max(...byOffset.keys());
  const weekCount = Math.floor(lastOffset / DAYS_PER_WEEK) + 1;

  return Array.from({ length: weekCount }, (_, index) => ({
    index,
    days: Array.from({ length: DAYS_PER_WEEK }, (_, day) => {
      const offset = index * DAYS_PER_WEEK + day;
      return {
        key: toDayKeyAtOffset(today, offset),
        offset,
        items: byOffset.get(offset) ?? [],
      };
    }),
  }));
}
