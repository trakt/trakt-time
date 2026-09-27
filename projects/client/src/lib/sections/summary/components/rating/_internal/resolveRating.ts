import { time } from '$lib/utils/timing/time.ts';
import { isOverrideFresh, type RatingOverride } from './RatingOverride.ts';

const RATED_AT_TOLERANCE = time.seconds(1);

type ServerRating = {
  rating: number;
  ratedAt: Date;
};

type ResolveRatingParams = {
  server: ServerRating | Nil;
  override: RatingOverride | Nil;
  now: number;
};

function hasServerCaughtUp(server: ServerRating | Nil, savedAt: number) {
  return server != null &&
    server.ratedAt.getTime() >= savedAt - RATED_AT_TOLERANCE;
}

export function resolveRating(
  { server, override, now }: ResolveRatingParams,
): ServerRating | undefined {
  if (!override) return server ?? undefined;
  if (!isOverrideFresh(override, now)) return server ?? undefined;
  if (hasServerCaughtUp(server, override.savedAt)) return server ?? undefined;
  if (override.rating === null) return undefined;

  return { rating: override.rating, ratedAt: new Date(override.savedAt) };
}
