import { describe, expect, it } from 'vitest';
import { daysFromToday, toLocalDayKey } from './toLocalDayKey.ts';

// Tests run with TZ=UTC (vitest-setup), so local == UTC here; the
// distinction matters at runtime, the math is what we can pin down.
describe('toLocalDayKey', () => {
  it('formats the local calendar day', () => {
    expect(toLocalDayKey(new Date(2026, 6, 4, 18, 0))).toBe('2026-07-04');
  });

  it('pads single-digit months and days', () => {
    expect(toLocalDayKey(new Date(2026, 0, 9, 1, 0))).toBe('2026-01-09');
  });

  it('keys late-evening times to the same local day', () => {
    expect(toLocalDayKey(new Date(2026, 6, 3, 23, 59))).toBe('2026-07-03');
  });
});

describe('daysFromToday', () => {
  const now = new Date(2026, 6, 3, 18, 30);

  it('returns 0 for today', () => {
    expect(daysFromToday('2026-07-03', now)).toBe(0);
  });

  it('returns 1 for tomorrow', () => {
    expect(daysFromToday('2026-07-04', now)).toBe(1);
  });

  it('returns 7 for exactly a week out', () => {
    expect(daysFromToday('2026-07-10', now)).toBe(7);
  });

  it('crosses month boundaries', () => {
    expect(daysFromToday('2026-08-02', now)).toBe(30);
  });
});
