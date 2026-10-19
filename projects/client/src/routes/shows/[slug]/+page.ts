import { browser } from '$app/environment';
import { fetchShowForCrawler } from '$lib/features/seo/requests/fetchShowForCrawler.ts';
import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ parent, params, fetch }) => {
  const { queryClient, isCrawler } = await parent();

  if (browser) {
    void queryClient.prefetchQuery(showSummaryQuery({ slug: params.slug }));
    return { crawlerShow: null };
  }

  if (!isCrawler) return { crawlerShow: null };

  return {
    crawlerShow: await fetchShowForCrawler({ fetch, slug: params.slug }),
  };
};
