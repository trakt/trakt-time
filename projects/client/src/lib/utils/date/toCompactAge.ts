import { toUnitFormatter } from '$lib/utils/formatting/number/toUnitFormatter.ts';

type CompactAgeParams = {
  date: Date;
  now: Date;
  locale: string;
};

const FALLBACK_UNIT_SUFFIX = {
  minute: 'm',
  hour: 'h',
  day: 'd',
  week: 'w',
} as const;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function toCompactAge({ date, now, locale }: CompactAgeParams): string {
  const elapsed = Math.max(0, now.getTime() - date.getTime());
  const format = (value: number, unit: keyof typeof FALLBACK_UNIT_SUFFIX) =>
    toUnitFormatter({
      locale,
      unit,
      suffix: FALLBACK_UNIT_SUFFIX[unit],
      options: { unitDisplay: 'narrow' },
    })(value);

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
