import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
import type { JsonLd } from '../models/SeoMeta.ts';
import { compact } from './_internal/compact.ts';
import { toIsoDate } from './_internal/toIsoDate.ts';
import { toIsoDuration } from './_internal/toIsoDuration.ts';

type EpisodeJsonLdParams = {
  episode: EpisodeEntry;
  show: Nil | ShowEntry;
  title: string;
  description: string;
  url: string;
  showUrl: string;
};

export function toEpisodeJsonLd(
  { episode, show, title, description, url, showUrl }: EpisodeJsonLdParams,
): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'TVEpisode',
    name: title,
    description,
    url,
    image: episode.cover.url ?? show?.cover.url.medium,
    episodeNumber: episode.number,
    datePublished: toIsoDate(episode.airDate),
    duration: toIsoDuration(episode.runtime),
    partOfSeason: {
      '@type': 'TVSeason',
      seasonNumber: episode.season,
    },
    partOfSeries: show
      ? { '@type': 'TVSeries', name: show.title, url: showUrl }
      : undefined,
  });
}
