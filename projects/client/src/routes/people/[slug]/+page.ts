import { browser } from '$app/environment';
import { peopleSummaryQuery } from '$lib/requests/queries/people/peopleSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ data, parent, params }) => {
  const { queryClient } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(peopleSummaryQuery({ slug: params.slug }));
  }

  return data;
};
