import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
import type { JsonLd } from '../models/SeoMeta.ts';
import { compact } from './_internal/compact.ts';
import { toAggregateRating } from './_internal/toAggregateRating.ts';
import { toIsoDate } from './_internal/toIsoDate.ts';

type ShowJsonLdParams = {
  show: ShowEntry;
  title: string;
  description: string;
  url: string;
};

export function toShowJsonLd(
  { show, title, description, url }: ShowJsonLdParams,
): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description,
    url,
    image: show.poster.url.medium,
    genre: show.genres,
    startDate: toIsoDate(show.airDate),
    numberOfEpisodes: show.episode.count || undefined,
    contentRating: show.certification,
    aggregateRating: toAggregateRating(show),
  });
}
