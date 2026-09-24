type EpisodeLike = {
  id: number;
  number: number;
  effectiveReleaseDate: Date;
};

type SeasonCount = {
  number: number;
  episodes: { count: number };
};

type EpisodeTarget = {
  season: number;
  number: number;
};

type CountSkippedEpisodesParams = {
  target: EpisodeTarget;
  currentSeasonEpisodes: ReadonlyArray<EpisodeLike>;
  previousSeasons: ReadonlyArray<SeasonCount>;
  watchedEpisodeIds: ReadonlySet<number>;
  watchedCountBySeason: ReadonlyMap<number, number>;
  now?: Date;
};

type FindSkippedEpisodeIdsParams = {
  target: EpisodeTarget;
  episodesBySeason: ReadonlyMap<number, ReadonlyArray<EpisodeLike>>;
  watchedEpisodeIds: ReadonlySet<number>;
  now?: Date;
};

const isSkippable = (
  { episode, watchedEpisodeIds, now }: {
    episode: EpisodeLike;
    watchedEpisodeIds: ReadonlySet<number>;
    now: Date;
  },
) => episode.effectiveReleaseDate <= now && !watchedEpisodeIds.has(episode.id);

const isEarlierRegularSeason = (season: number, target: EpisodeTarget) =>
  season > 0 && season < target.season;

export function countSkippedEpisodes(
  {
    target,
    currentSeasonEpisodes,
    previousSeasons,
    watchedEpisodeIds,
    watchedCountBySeason,
    now = new Date(),
  }: CountSkippedEpisodesParams,
): number {
  if (target.season === 0) return 0;

  const currentSeasonGap = currentSeasonEpisodes
    .filter((episode) => episode.number < target.number)
    .filter((episode) => isSkippable({ episode, watchedEpisodeIds, now }))
    .length;

  const previousSeasonsGap = previousSeasons
    .filter((season) => isEarlierRegularSeason(season.number, target))
    .map((season) =>
      Math.max(
        0,
        season.episodes.count - (watchedCountBySeason.get(season.number) ?? 0),
      )
    )
    .reduce((sum, gap) => sum + gap, 0);

  return currentSeasonGap + previousSeasonsGap;
}

export function findSkippedEpisodeIds(
  { target, episodesBySeason, watchedEpisodeIds, now = new Date() }:
    FindSkippedEpisodeIdsParams,
): number[] {
  if (target.season === 0) return [];

  return [...episodesBySeason.entries()]
    .filter(([season]) => season > 0 && season <= target.season)
    .flatMap(([season, episodes]) =>
      episodes.filter((episode) =>
        season < target.season || episode.number < target.number
      )
    )
    .filter((episode) => isSkippable({ episode, watchedEpisodeIds, now }))
    .map((episode) => episode.id);
}
