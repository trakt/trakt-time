import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
import { toMovieJsonLd } from '../json-ld/toMovieJsonLd.ts';
import type { SeoMeta } from '../models/SeoMeta.ts';
import { toSeoDescription } from '../toSeoDescription.ts';

type MovieSeoParams = {
  movie: Nil | MovieEntry;
  title: Nil | string;
  overview: Nil | string;
  url: string;
};

export function toMovieSeo(
  { movie, title, overview, url }: MovieSeoParams,
): SeoMeta {
  if (!movie) return { type: 'video.movie' };

  const name = title || movie.title;
  const heading = movie.year ? `${name} (${movie.year})` : name;
  const description = toSeoDescription(overview || movie.overview);

  return {
    title: heading,
    description,
    image: movie.cover.url.medium,
    imageAlt: name,
    type: 'video.movie',
    jsonLd: [toMovieJsonLd({ movie, title: name, description, url })],
  };
}
