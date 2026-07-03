/*
 * Key a date by the LOCAL calendar day. Using toISOString would bucket by
 * the UTC day, which mislabels evening releases for users west of UTC
 * (an episode airing 01:00 UTC Saturday is Friday evening for them).
 */
export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/*
 * Whole local days from today's midnight to the given day key's midnight.
 * 0 = today, 1 = tomorrow.
 */
export function daysFromToday(dayKey: string, now = new Date()): number {
  const [year, month, day] = dayKey.split('-').map(Number);
  const target = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return Math.round(
    (target.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000),
  );
}
