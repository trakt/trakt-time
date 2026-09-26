import { daysFromToday } from '$lib/utils/date/toLocalDayKey.ts';
import { capitalizeFirst } from '$lib/utils/string/capitalizeFirst.ts';

const WEEK_IN_DAYS = 7;

const toNoonDate = (dayKey: string) => new Date(`${dayKey}T12:00:00`);

const formatToday = (locale: string) =>
  capitalizeFirst(
    new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day'),
    locale,
  );

export function toUpcomingDayLabel(
  dayKey: string,
  locale: string,
  now = new Date(),
): string {
  const diffDays = daysFromToday(dayKey, now);

  if (diffDays <= 0) return formatToday(locale);

  const format: Intl.DateTimeFormatOptions = diffDays <= WEEK_IN_DAYS
    ? { weekday: 'long' }
    : { month: 'short', day: 'numeric' };

  return capitalizeFirst(
    new Intl.DateTimeFormat(locale, format).format(toNoonDate(dayKey)),
    locale,
  );
}

export function toUpcomingWeekdayLabel(
  dayKey: string,
  locale: string,
  now = new Date(),
): string {
  if (daysFromToday(dayKey, now) <= 0) return formatToday(locale);

  return capitalizeFirst(
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
      toNoonDate(dayKey),
    ),
    locale,
  );
}

export function toUpcomingDateLabel(dayKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
    .format(toNoonDate(dayKey));
}

export function toUpcomingRangeLabel(
  { start, end, locale }: { start: string; end: string; locale: string },
): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
    .formatRange(toNoonDate(start), toNoonDate(end));
}
