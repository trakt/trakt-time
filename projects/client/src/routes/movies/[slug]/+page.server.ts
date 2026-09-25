import { isCrawlerRequest } from '$lib/features/seo/isCrawlerRequest.ts';
import { fetchMovieForCrawler } from '$lib/features/seo/requests/fetchMovieForCrawler.ts';
import type { PageServerLoad } from './$types.ts';

export const load: PageServerLoad = async (
  { params, fetch, request, locals },
) => {
  const isCrawler = isCrawlerRequest({
    userAgent: request.headers.get('user-agent'),
    isLegitimateBot: locals.isLegitimateBot,
  });
  if (!isCrawler) return { crawlerMovie: null };

  return {
    crawlerMovie: await fetchMovieForCrawler({ fetch, slug: params.slug }),
  };
};
