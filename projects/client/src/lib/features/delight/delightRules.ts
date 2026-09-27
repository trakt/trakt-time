const MAX_RATING = 10;
const LOW_RATING_CEILING = 2;

export function ratingDelight(
  rating: number,
): 'rating-high' | 'rating-low' | null {
  if (rating === MAX_RATING) return 'rating-high';
  if (rating > 0 && rating <= LOW_RATING_CEILING) return 'rating-low';
  return null;
}

type ShouldFireParams = {
  onceKey?: string;
  fired: ReadonlySet<string>;
};

export function shouldFire({ onceKey, fired }: ShouldFireParams): boolean {
  if (!onceKey) return true;
  return !fired.has(onceKey);
}

function hash(value: string): number {
  return Array.from(value).reduce(
    (acc, char) => Math.imul(acc ^ char.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );
}

type BucketParams<T extends string> = {
  seed: string;
  experiment: string;
  variants: ReadonlyArray<T>;
};

export function bucketFor<T extends string>(
  { seed, experiment, variants }: BucketParams<T>,
): T {
  const index = hash(`${experiment}:${seed}`) % variants.length;
  return variants[index] as T;
}
