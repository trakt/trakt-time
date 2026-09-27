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

type SeasonEpisode = { id: number; releaseDate: Date };

type SeasonMilestoneParams = {
  episodes: ReadonlyArray<SeasonEpisode>;
  watchedIds: ReadonlySet<number>;
  isLatestAiredSeason: boolean;
  hasEnded: boolean;
  now: Date;
};

export function seasonMilestone(
  { episodes, watchedIds, isLatestAiredSeason, hasEnded, now }:
    SeasonMilestoneParams,
): 'caught-up' | 'season-complete' | null {
  const aired = episodes.filter((episode) => episode.releaseDate <= now);
  if (aired.length === 0) return null;
  if (!aired.every((episode) => watchedIds.has(episode.id))) return null;

  if (isLatestAiredSeason && !hasEnded) return 'caught-up';
  if (aired.length === episodes.length) return 'season-complete';
  return null;
}

type LatestAiredSeasonParams = {
  seasons: ReadonlyArray<{ number: number; airDate: Date }>;
  now: Date;
};

export function latestAiredSeason(
  { seasons, now }: LatestAiredSeasonParams,
): number | null {
  const aired = seasons
    .filter((season) => season.number > 0 && season.airDate <= now)
    .map((season) => season.number);

  return aired.length ? Math.max(...aired) : null;
}
