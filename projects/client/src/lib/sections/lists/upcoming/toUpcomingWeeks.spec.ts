import { describe, expect, it } from 'vitest';
import { toUpcomingWeeks } from './toUpcomingWeeks.ts';

type Item = { id: string; day: string };

const today = new Date(2026, 8, 26, 15, 0);
const toDayKey = (item: Item) => item.day;

describe('toUpcomingWeeks', () => {
  it('returns no weeks for no items', () => {
    expect(toUpcomingWeeks({ items: [], toDayKey, today })).toEqual([]);
  });

  it('lays out a full week starting today, including empty days', () => {
    const weeks = toUpcomingWeeks({
      items: [{ id: 'a', day: '2026-09-28' }],
      toDayKey,
      today,
    });

    expect(weeks).toHaveLength(1);
    expect(weeks[0]?.days.map((d) => d.key)).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
    expect(weeks[0]?.days[2]?.items.map((i) => i.id)).toEqual(['a']);
    expect(weeks[0]?.days[0]?.items).toEqual([]);
  });

  it('folds items from earlier days into today', () => {
    const weeks = toUpcomingWeeks({
      items: [{ id: 'late', day: '2026-09-25' }, { id: 'now', day: '2026-09-26' }],
      toDayKey,
      today,
    });

    expect(weeks[0]?.days[0]?.items.map((i) => i.id)).toEqual(['late', 'now']);
  });

  it('adds weeks up to the last item and keeps item order per day', () => {
    const weeks = toUpcomingWeeks({
      items: [
        { id: 'a', day: '2026-10-05' },
        { id: 'b', day: '2026-10-05' },
        { id: 'c', day: '2026-10-12' },
      ],
      toDayKey,
      today,
    });

    expect(weeks.map((w) => w.index)).toEqual([0, 1, 2]);
    expect(weeks[1]?.days[2]?.items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(weeks[2]?.days[2]?.key).toBe('2026-10-12');
    expect(weeks[2]?.days[2]?.items.map((i) => i.id)).toEqual(['c']);
  });
});
