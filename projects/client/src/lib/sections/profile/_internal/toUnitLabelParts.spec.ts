import { describe, expect, it } from 'vitest';
import { toShortWatchTime, toUnitLabelParts } from './toUnitLabelParts.ts';

describe('toUnitLabelParts', () => {
  it('splits the number from the unit name', () => {
    expect(toUnitLabelParts({ unit: 'year', value: 4 }, 'en')).toEqual({
      value: '4',
      label: 'years',
    });
  });

  it('uses the singular form for one', () => {
    expect(toUnitLabelParts({ unit: 'month', value: 1 }, 'en')).toEqual({
      value: '1',
      label: 'month',
    });
  });

  it('translates the unit name', () => {
    expect(toUnitLabelParts({ unit: 'day', value: 5 }, 'de-DE').label).toBe(
      'Tage',
    );
  });
});

describe('toShortWatchTime', () => {
  it('keeps the two largest units', () => {
    expect(
      toShortWatchTime([
        { unit: 'year', value: 3 },
        { unit: 'month', value: 8 },
        { unit: 'day', value: 29 },
      ], 'en'),
    ).toBe('3y 8m');
  });
});
