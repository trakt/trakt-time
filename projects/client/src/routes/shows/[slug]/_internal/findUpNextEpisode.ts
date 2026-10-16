import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';

type FindUpNextEpisodeParams = {
  episodes: ReadonlyArray<EpisodeEntry>;
  watchedIds: ReadonlySet<number>;
  now?: Date;
};

export function findUpNextEpisode(
  { episodes, watchedIds, now = new Date() }: FindUpNextEpisodeParams,
): EpisodeEntry | undefined {
  const lastWatchedIndex = episodes.findLastIndex(({ id }) =>
    watchedIds.has(id)
  );
  if (lastWatchedIndex === -1) return undefined;

  const next = episodes.at(lastWatchedIndex + 1);

  return next && next.effectiveReleaseDate <= now ? next : undefined;
}
