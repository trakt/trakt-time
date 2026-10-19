import { browser } from '$app/environment';
import { fetchEpisodeForCrawler } from '$lib/features/seo/requests/fetchEpisodeForCrawler.ts';
import { fetchShowForCrawler } from '$lib/features/seo/requests/fetchShowForCrawler.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = async ({ parent, params, fetch }) => {
  if (browser) return { crawlerShow: null, crawlerEpisode: null };

  const { isCrawler } = await parent();
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
