const PROGRESS_STEP = 10;
const SPECIALS_SEASON = 0;

type ShowWatchCounts = {
  playsPerSeason: ReadonlyMap<number, number> | Nil;
  episodeCount: number | Nil;
};

function countWatchedEpisodes(
  playsPerSeason: ReadonlyMap<number, number> | Nil,
): number {
  return Array.from(playsPerSeason?.entries() ?? [])
    .filter(([season]) => season !== SPECIALS_SEASON)
    .reduce((sum, [, count]) => sum + count, 0);
}

export function toWatchProgress(shows: ReadonlyArray<ShowWatchCounts>): number {
  const counts = shows.map(({ playsPerSeason, episodeCount }) => {
    const total = Math.max(episodeCount ?? 0, 0);

    return {
      total,
      watched: Math.min(countWatchedEpisodes(playsPerSeason), total),
    };
  });

  const total = counts.reduce((sum, count) => sum + count.total, 0);
  if (total <= 0) return 0;

  const watched = counts.reduce((sum, count) => sum + count.watched, 0);
  const percentage = (watched / total) * 100;

  return Math.floor(percentage / PROGRESS_STEP) * PROGRESS_STEP;
}
