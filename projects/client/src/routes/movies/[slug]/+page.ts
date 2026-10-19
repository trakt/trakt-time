import { browser } from '$app/environment';
import { movieSummaryQuery } from '$lib/requests/queries/movies/movieSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ data, parent, params }) => {
  const { queryClient } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(movieSummaryQuery({ slug: params.slug }));
  }

  return data;
};
