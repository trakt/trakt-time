import { browser } from '$app/environment';
import { fetchMovieForCrawler } from '$lib/features/seo/requests/fetchMovieForCrawler.ts';
import { movieSummaryQuery } from '$lib/requests/queries/movies/movieSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ parent, params, fetch }) => {
  const { queryClient, isCrawler } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(movieSummaryQuery({ slug: params.slug }));
    return { crawlerMovie: null };
  }

  if (!isCrawler) return { crawlerMovie: null };

  return {
    crawlerMovie: await fetchMovieForCrawler({ fetch, slug: params.slug }),
  };
};
