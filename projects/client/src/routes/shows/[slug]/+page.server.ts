import { isCrawlerRequest } from '$lib/features/seo/isCrawlerRequest.ts';
import { fetchShowForCrawler } from '$lib/features/seo/requests/fetchShowForCrawler.ts';
import type { PageServerLoad } from './$types.ts';

export const load: PageServerLoad = async (
  { params, fetch, request, locals },
) => {
  const isCrawler = isCrawlerRequest({
    userAgent: request.headers.get('user-agent'),
    isLegitimateBot: locals.isLegitimateBot,
  });
  if (!isCrawler) return { crawlerShow: null };

  return {
    crawlerShow: await fetchShowForCrawler({ fetch, slug: params.slug }),
  };
};
