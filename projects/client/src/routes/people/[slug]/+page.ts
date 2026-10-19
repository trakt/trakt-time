import { browser } from '$app/environment';
import { fetchPersonForCrawler } from '$lib/features/seo/requests/fetchPersonForCrawler.ts';
import { peopleSummaryQuery } from '$lib/requests/queries/people/peopleSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ parent, params, fetch }) => {
  const { queryClient, isCrawler } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(peopleSummaryQuery({ slug: params.slug }));
    return { crawlerPerson: null };
  }

  if (!isCrawler) return { crawlerPerson: null };

  return {
    crawlerPerson: await fetchPersonForCrawler({ fetch, slug: params.slug }),
  };
};
