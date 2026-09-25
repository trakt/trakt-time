import { isCrawlerRequest } from '$lib/features/seo/isCrawlerRequest.ts';
import { fetchPersonForCrawler } from '$lib/features/seo/requests/fetchPersonForCrawler.ts';
import type { PageServerLoad } from './$types.ts';

export const load: PageServerLoad = async (
  { params, fetch, request, locals },
) => {
  const isCrawler = isCrawlerRequest({
    userAgent: request.headers.get('user-agent'),
    isLegitimateBot: locals.isLegitimateBot,
  });
  if (!isCrawler) return { crawlerPerson: null };

  return {
    crawlerPerson: await fetchPersonForCrawler({ fetch, slug: params.slug }),
  };
};
