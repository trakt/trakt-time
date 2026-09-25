import { isCrawlerRequest } from '$lib/features/seo/isCrawlerRequest.ts';
import { fetchEpisodeForCrawler } from '$lib/features/seo/requests/fetchEpisodeForCrawler.ts';
import { fetchShowForCrawler } from '$lib/features/seo/requests/fetchShowForCrawler.ts';
import type { PageServerLoad } from './$types.ts';

export const load: PageServerLoad = async (
  { params, fetch, request, locals },
) => {
  const isCrawler = isCrawlerRequest({
    userAgent: request.headers.get('user-agent'),
    isLegitimateBot: locals.isLegitimateBot,
  });
  if (!isCrawler) return { crawlerShow: null, crawlerEpisode: null };

  const [crawlerShow, crawlerEpisode] = await Promise.all([
    fetchShowForCrawler({ fetch, slug: params.slug }),
    fetchEpisodeForCrawler({
      fetch,
      slug: params.slug,
      season: Number(params.season),
      episode: Number(params.episode),
    }),
  ]);

  return { crawlerShow, crawlerEpisode };
};
