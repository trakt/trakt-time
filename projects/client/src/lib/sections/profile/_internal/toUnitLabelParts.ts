import type { WatchTimePart } from './toWatchTime.ts';

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
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
        unitDisplay: 'narrow',
      }).format(value)
    )
    .join(' ');
}
