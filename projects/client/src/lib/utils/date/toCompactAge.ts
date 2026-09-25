type CompactAgeParams = {
  date: Date;
  now: Date;
  locale: string;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function toCompactAge({ date, now, locale }: CompactAgeParams): string {
  const elapsed = Math.max(0, now.getTime() - date.getTime());
  const format = (value: number, unit: 'minute' | 'hour' | 'day' | 'week') =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'narrow',
    }).format(value);

  if (elapsed < HOUR) {
    return format(Math.max(1, Math.floor(elapsed / MINUTE)), 'minute');
  }
  if (elapsed < DAY) return format(Math.floor(elapsed / HOUR), 'hour');
  if (elapsed < WEEK) return format(Math.floor(elapsed / DAY), 'day');
  if (elapsed < 5 * WEEK) return format(Math.floor(elapsed / WEEK), 'week');

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
