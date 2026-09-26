import { daysFromToday } from '$lib/utils/date/toLocalDayKey.ts';
import { capitalizeFirst } from '$lib/utils/string/capitalizeFirst.ts';

const WEEK_IN_DAYS = 7;

const toNoonDate = (dayKey: string) => new Date(`${dayKey}T12:00:00`);

export function toPastDayLabel(
  dayKey: string,
  locale: string,
  now = new Date(),
): string {
  const daysAgo = -daysFromToday(dayKey, now);

  if (daysAgo <= 1) {
    return capitalizeFirst(
      new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        -Math.max(daysAgo, 0),
        'day',
      ),
      locale,
    );
  }

  const format: Intl.DateTimeFormatOptions = daysAgo < WEEK_IN_DAYS
    ? { weekday: 'long' }
    : { month: 'short', day: 'numeric' };

  return capitalizeFirst(
    new Intl.DateTimeFormat(locale, format).format(toNoonDate(dayKey)),
    locale,
  );
}
