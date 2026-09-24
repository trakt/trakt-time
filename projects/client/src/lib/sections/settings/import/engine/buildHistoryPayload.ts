import type { HistoryAddRequest } from '@trakt/api';
import {
  DEFAULT_EPISODE_MATCH_MODE,
  type EpisodeMatchMode,
  type ImportType,
  type UniversalImportItem,
} from '../ImportTypes.ts';
import {
  type IdPriority,
  MOVIE_IDS,
  pickIds,
  type ResolvedIds,
  SEASON_IDS,
  SHOW_IDS,
  toEpisodeIdPriority,
} from './pickIds.ts';

type HistoryEntry =
  | { ids: ResolvedIds; watched_at?: string }
  | { title: string; year: number; watched_at?: string };

function toHistoryEntry(
  { ids, watched_at }: UniversalImportItem,
  priority: IdPriority,
): HistoryEntry | null {
  const resolvedIds = pickIds(ids, priority);
  if (resolvedIds) return { ids: resolvedIds, watched_at };
  return null;
}

function toHistoryShow(item: UniversalImportItem): HistoryEntry | null {
  const entry = toHistoryEntry(item, SHOW_IDS);
  if (entry) return entry;

  const { title, year, watched_at } = item;
  if (title && year) return { title, year, watched_at };
  return null;
}

function hasEpisodeId(item: UniversalImportItem): boolean {
  return pickIds(item.ids, toEpisodeIdPriority(item)) != null;
}

function isPositional(
  item: UniversalImportItem,
): item is UniversalImportItem & { season: number; episode: number } {
  return (item.showTvdb != null || item.showImdb != null) &&
    item.season != null && item.episode != null;
}

type PositionalEpisode = { number: number; watched_at?: string };
type ShowIds = { tvdb?: number; imdb?: string };
type ShowGroup = { ids: ShowIds; seasons: Map<number, PositionalEpisode[]> };
type PositionalShow = {
  ids: ShowIds;
  seasons: Array<{ number: number; episodes: PositionalEpisode[] }>;
};

function toShowIds(item: UniversalImportItem): ShowIds {
  return {
    ...(item.showTvdb != null ? { tvdb: item.showTvdb } : {}),
    ...(item.showImdb != null ? { imdb: item.showImdb } : {}),
  };
}

function toPositionalShows(
  items: ReadonlyArray<
    UniversalImportItem & { season: number; episode: number }
  >,
): PositionalShow[] {
  const byShow = items.reduce((shows, item) => {
    const key = item.showTvdb != null
      ? `tvdb:${item.showTvdb}`
      : `imdb:${item.showImdb}`;
    const group = shows.get(key) ??
      { ids: {} as ShowIds, seasons: new Map<number, PositionalEpisode[]>() };
    const episodes = group.seasons.get(item.season) ?? [];
    group.seasons.set(item.season, [
      ...episodes,
      { number: item.episode, watched_at: item.watched_at },
    ]);
    return shows.set(key, {
      ids: { ...group.ids, ...toShowIds(item) },
      seasons: group.seasons,
    });
  }, new Map<string, ShowGroup>());

  return [...byShow.values()].map(({ ids, seasons }) => ({
    ids,
    seasons: [...seasons].map(([number, episodes]) => ({ number, episodes })),
  }));
}

export function buildHistoryPayload(
  items: ReadonlyArray<UniversalImportItem>,
  episodeMatch: EpisodeMatchMode = DEFAULT_EPISODE_MATCH_MODE,
): HistoryAddRequest {
  const episodeItems = items.filter((item) => item.type === 'episode');

  const preferPositional = episodeMatch === 'positional';
  const positionalEpisodes = episodeItems
    .filter(isPositional)
    .filter((item) => preferPositional || !hasEpisodeId(item));
  const positionalSet = new Set<UniversalImportItem>(positionalEpisodes);
  const idEpisodes = episodeItems.filter((item) =>
    !positionalSet.has(item) && hasEpisodeId(item)
  );

  const collect = (
    type: ImportType,
    map: (item: UniversalImportItem) => HistoryEntry | null,
  ) =>
    items
      .filter((item) => item.type === type)
      .flatMap((item) => map(item) ?? []);

  return {
    movies: collect('movie', (item) => toHistoryEntry(item, MOVIE_IDS)),
    shows: [
      ...collect('show', toHistoryShow),
      ...toPositionalShows(positionalEpisodes),
    ],
    seasons: collect('season', (item) => toHistoryEntry(item, SEASON_IDS)),
    episodes: idEpisodes.flatMap((item) =>
      toHistoryEntry(item, toEpisodeIdPriority(item)) ?? []
    ),
  } as HistoryAddRequest;
}
