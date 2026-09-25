export type WatchTimeUnit = 'year' | 'month' | 'day' | 'hour';

export type WatchTimePart = {
  unit: WatchTimeUnit;
  value: number;
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = DAYS_PER_YEAR / 12;

export function toWatchTime(minutes: number): ReadonlyArray<WatchTimePart> {
  const totalDays = Math.floor(minutes / MINUTES_PER_DAY);

  if (totalDays === 0) {
    return [{ unit: 'hour', value: Math.floor(minutes / MINUTES_PER_HOUR) }];
  }

  const years = Math.floor(totalDays / DAYS_PER_YEAR);
  const daysInYear = totalDays % DAYS_PER_YEAR;
  const months = Math.floor(daysInYear / DAYS_PER_MONTH);
  const days = Math.floor(daysInYear - months * DAYS_PER_MONTH);

  const parts: ReadonlyArray<WatchTimePart> = [
    { unit: 'year', value: years },
    { unit: 'month', value: months },
    { unit: 'day', value: days },
  ];

  return parts.filter((part) => part.value > 0);
}
