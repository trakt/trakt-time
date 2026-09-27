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

const SITTING_GAP = 3 * 60 * 60 * 1000;

type BingeCountParams = {
  watchedDates: ReadonlyArray<Date>;
  now: Date;
};

export function bingeCount({ watchedDates, now }: BingeCountParams): number {
  const [latest, ...earlier] = [...watchedDates]
    .map((date) => date.getTime())
    .sort((a, b) => b - a);

  if (latest === undefined || now.getTime() - latest > SITTING_GAP) return 0;

  const inSitting = earlier.findIndex((time, index) =>
    (index === 0 ? latest : earlier[index - 1]!) - time > SITTING_GAP
  );

  return 1 + (inSitting === -1 ? earlier.length : inSitting);
}

type ActiveBingeParams = {
  shows: Iterable<{ id: number; watchedDates: ReadonlyArray<Date> }>;
  now: Date;
};

export function activeBinge(
  { shows, now }: ActiveBingeParams,
): { showId: number; count: number } | null {
  return [...shows]
    .map((show) => ({
      showId: show.id,
      count: bingeCount({ watchedDates: show.watchedDates, now }),
    }))
    .reduce<{ showId: number; count: number } | null>(
      (best, current) => current.count > (best?.count ?? 0) ? current : best,
      null,
    );
}

const NEW_SEASON_WINDOW = 14 * 24 * 60 * 60 * 1000;

type NewSeasonParams = {
  type: string;
  number: number;
  releaseDate: Date;
  now: Date;
};

export function isNewSeason(
  { type, number, releaseDate, now }: NewSeasonParams,
): boolean {
  const elapsed = now.getTime() - releaseDate.getTime();
  return type === 'season_premiere' && number === 1 && elapsed >= 0 &&
    elapsed <= NEW_SEASON_WINDOW;
}

type CreditsScene = 'during' | 'after' | 'both';

type CheckInSummaryParams = {
  startedAt: Date;
  runtimeMinutes: number;
  postCredits: ReadonlyArray<'during' | 'after'>;
};

export function checkInSummary(
  { startedAt, runtimeMinutes, postCredits }: CheckInSummaryParams,
): { endsAt: Date; creditsScene: CreditsScene | null } {
  const endsAt = new Date(startedAt.getTime() + runtimeMinutes * 60 * 1000);
  const hasDuring = postCredits.includes('during');
  const hasAfter = postCredits.includes('after');

  if (hasDuring && hasAfter) return { endsAt, creditsScene: 'both' };
  if (hasDuring) return { endsAt, creditsScene: 'during' };
  if (hasAfter) return { endsAt, creditsScene: 'after' };
  return { endsAt, creditsScene: null };
}

const HIGH_MATCH_SCORE = 80;

export function isHighMatch(score: number): boolean {
  return score >= HIGH_MATCH_SCORE;
}

export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - Math.min(Math.max(progress, 0), 1), 3);
}

type CrossedMilestoneParams = {
  before: number;
  after: number;
  thresholds: ReadonlyArray<number>;
};

export function crossedMilestone(
  { before, after, thresholds }: CrossedMilestoneParams,
): number | null {
  const crossed = thresholds.filter((threshold) =>
    before < threshold && threshold <= after
  );
  return crossed.length ? Math.max(...crossed) : null;
}

export function isSeriesFinale(
  { episodeType, hasEnded }: { episodeType: string; hasEnded: boolean },
): boolean {
  return episodeType === 'series_finale' && hasEnded;
}
