import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
import type { JsonLd } from '../models/SeoMeta.ts';
import { compact } from './_internal/compact.ts';
import { toAggregateRating } from './_internal/toAggregateRating.ts';
import { toIsoDate } from './_internal/toIsoDate.ts';
import { toIsoDuration } from './_internal/toIsoDuration.ts';

type MovieJsonLdParams = {
  movie: MovieEntry;
  title: string;
  description: string;
  url: string;
};

export function toMovieJsonLd(
  { movie, title, description, url }: MovieJsonLdParams,
): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description,
    url,
    image: movie.poster.url.medium,
    genre: movie.genres,
    datePublished: toIsoDate(movie.releaseDate),
    duration: toIsoDuration(movie.runtime),
    contentRating: movie.certification,
    aggregateRating: toAggregateRating(movie),
  });
}
