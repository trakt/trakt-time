import { browser } from '$app/environment';
import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ data, parent, params }) => {
  const { queryClient } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(showSummaryQuery({ slug: params.slug }));
  }

  return data;
};
