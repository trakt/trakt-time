export const STAR_COUNT = 5;

export function toStarsFromUserRating(rating: number): number {
  return rating / 2;
}

export function toStarsFromScore(score: number): number {
  return Math.round(score * STAR_COUNT * 10) / 10;
}

type FormatStarsParams = {
  value: number;
  locale: string;
};

export function formatStars({ value, locale }: FormatStarsParams): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
    value,
  );
}
