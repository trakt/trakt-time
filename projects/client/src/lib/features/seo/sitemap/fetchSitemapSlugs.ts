import { unauthorizedApi } from '$lib/requests/api.ts';

const SITEMAP_MEDIA_LIMIT = 100;

type SitemapSlugs = {
  shows: ReadonlyArray<string>;
  movies: ReadonlyArray<string>;
};

type Slugged = { ids: { slug?: Nil | string } };

const toSlugs = (items: ReadonlyArray<Slugged>) =>
  items.map((item) => item.ids.slug).filter((slug): slug is string =>
    Boolean(slug)
  );

type FetchSitemapSlugsParams = {
  fetch: typeof globalThis.fetch;
};

export async function fetchSitemapSlugs(
  { fetch }: FetchSitemapSlugsParams,
): Promise<SitemapSlugs> {
  const client = unauthorizedApi({ fetch });
  const query = { limit: SITEMAP_MEDIA_LIMIT };

  const [popularShows, trendingShows, popularMovies, trendingMovies] =
    await Promise.all([
      client.shows.popular({ query }).catch(() => null),
      client.shows.trending({ query }).catch(() => null),
      client.movies.popular({ query }).catch(() => null),
      client.movies.trending({ query }).catch(() => null),
    ]);

  return {
    shows: [
      ...(popularShows?.status === 200 ? toSlugs(popularShows.body) : []),
      ...(trendingShows?.status === 200
        ? toSlugs(trendingShows.body.map((entry) => entry.show))
        : []),
    ],
    movies: [
      ...(popularMovies?.status === 200 ? toSlugs(popularMovies.body) : []),
      ...(trendingMovies?.status === 200
        ? toSlugs(trendingMovies.body.map((entry) => entry.movie))
        : []),
    ],
  };
}
