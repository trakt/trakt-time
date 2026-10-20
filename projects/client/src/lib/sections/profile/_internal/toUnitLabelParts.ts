import { toUnitFormatter } from '$lib/utils/formatting/number/toUnitFormatter.ts';
import type { WatchTimePart, WatchTimeUnit } from './toWatchTime.ts';

const FALLBACK_UNIT_SUFFIX: Record<WatchTimeUnit, string> = {
  year: 'y',
  month: 'mo',
  day: 'd',
  hour: 'h',
};

type UnitLabelParts = {
  value: string;
  label: string;
};

export function toUnitLabelParts(
  { unit, value }: WatchTimePart,
  locale: string,
): UnitLabelParts {
  const parts = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).formatToParts(value);

  return {
    value: parts
      .filter((part) => part.type === 'integer' || part.type === 'group')
      .map((part) => part.value)
      .join(''),
    label: parts
      .filter((part) => part.type === 'unit')
      .map((part) => part.value)
      .join(' '),
  };
}

export function toShortWatchTime(
  parts: ReadonlyArray<WatchTimePart>,
  locale: string,
): string {
  return parts
    .slice(0, 2)
    .map(({ unit, value }) =>
      toUnitFormatter({
        locale,
        unit,
        suffix: FALLBACK_UNIT_SUFFIX[unit],
        options: { unitDisplay: 'narrow' },
      })(value),
    )
    .join(' ');
}
