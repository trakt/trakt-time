import type { Season } from '$lib/requests/models/Season.ts';

export type EpisodeRef = { season: number; episode: number };

type SeasonCount = Pick<Season, 'number' | 'episodes'>;

type ToAdjacentEpisodesParams = {
  current: EpisodeRef;
  seasons: ReadonlyArray<SeasonCount>;
};

type AdjacentEpisodes = {
  previous: EpisodeRef | null;
  next: EpisodeRef | null;
};

const SPECIALS = 0;

function toSiblingSeasons(
  { current, seasons }: ToAdjacentEpisodesParams,
) {
  const isSpecial = current.season === SPECIALS;

  return seasons
    .filter((season) => (season.number === SPECIALS) === isSpecial)
    .filter((season) => season.episodes.count > 0)
    .toSorted((a, b) => a.number - b.number);
}

type StepParams = {
  current: EpisodeRef;
  season: SeasonCount;
  neighbour: SeasonCount | undefined;
};

function toPrevious({ current, season, neighbour }: StepParams) {
  if (current.episode > 1) {
    return { season: season.number, episode: current.episode - 1 };
  }
  if (!neighbour) return null;

  return { season: neighbour.number, episode: neighbour.episodes.count };
}

function toNext({ current, season, neighbour }: StepParams) {
  if (current.episode < season.episodes.count) {
    return { season: season.number, episode: current.episode + 1 };
  }
  if (!neighbour) return null;

  return { season: neighbour.number, episode: 1 };
}

export function toAdjacentEpisodes(
  params: ToAdjacentEpisodesParams,
): AdjacentEpisodes {
  const { current } = params;
  const siblings = toSiblingSeasons(params);
  const index = siblings.findIndex((season) =>
    season.number === current.season
  );
  const season = siblings[index];

  if (!season) return { previous: null, next: null };

  return {
    previous: toPrevious({ current, season, neighbour: siblings[index - 1] }),
    next: toNext({ current, season, neighbour: siblings[index + 1] }),
  };
}
