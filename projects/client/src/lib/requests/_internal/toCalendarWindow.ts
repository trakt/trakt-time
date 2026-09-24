import { toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';
import type { PageMeta } from '../models/Paginatable.ts';

export const CALENDAR_WINDOW_DAYS = 30;
export const CALENDAR_WINDOW_COUNT = 12;

type CalendarWindowParams = {
  startDate: string;
  page?: number;
};

export function toCalendarWindowStart(
  { startDate, page = 1 }: CalendarWindowParams,
): string {
  const [year, month, day] = startDate.split('-').map(Number);
  const start = new Date(
    year ?? 0,
    (month ?? 1) - 1,
    (day ?? 1) + (page - 1) * CALENDAR_WINDOW_DAYS,
  );

  return toLocalDayKey(start);
}

export function toCalendarPageMeta(page = 1): PageMeta {
  return {
    type: 'paginated',
    current: page,
    total: CALENDAR_WINDOW_COUNT,
  };
}
