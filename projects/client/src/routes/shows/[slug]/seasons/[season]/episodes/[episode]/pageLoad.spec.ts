import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.ts';

const environment = vi.hoisted(() => ({ browser: true }));
const crawler = vi.hoisted(() => ({
  fetchShow: vi.fn(),
  fetchEpisode: vi.fn(),
}));

vi.mock('$app/environment', () => environment);
vi.mock('$lib/features/seo/requests/fetchShowForCrawler.ts', () => ({
  fetchShowForCrawler: crawler.fetchShow,
}));
vi.mock('$lib/features/seo/requests/fetchEpisodeForCrawler.ts', () => ({
  fetchEpisodeForCrawler: crawler.fetchEpisode,
}));

const PARAMS = { slug: 'some-slug', season: '2', episode: '5' };

function runLoad({ isCrawler = false }: { isCrawler?: boolean } = {}) {
  const fetch = vi.fn();
  const result = load({
    fetch,
    params: PARAMS,
    parent: () => Promise.resolve({ isCrawler }),
  } as unknown as Parameters<typeof load>[0]);

  return { fetch, result };
}

describe('episode page load', () => {
  beforeEach(() => {
    environment.browser = true;
    crawler.fetchShow.mockReset();
    crawler.fetchEpisode.mockReset();
  });

  it('returns no crawler data in the browser without fetching it', async () => {
    const { result } = runLoad({ isCrawler: true });

    expect(await result).toEqual({ crawlerShow: null, crawlerEpisode: null });
    expect(crawler.fetchShow).not.toHaveBeenCalled();
    expect(crawler.fetchEpisode).not.toHaveBeenCalled();
  });

  it('fetches the show and episode on the server for a crawler', async () => {
    environment.browser = false;
    const show = { id: 1 };
    const episode = { id: 2 };
    crawler.fetchShow.mockResolvedValue(show);
    crawler.fetchEpisode.mockResolvedValue(episode);
    const { fetch, result } = runLoad({ isCrawler: true });

    expect(await result).toEqual({
      crawlerShow: show,
      crawlerEpisode: episode,
    });
    expect(crawler.fetchShow).toHaveBeenCalledWith({
      fetch,
      slug: PARAMS.slug,
    });
    expect(crawler.fetchEpisode).toHaveBeenCalledWith({
      fetch,
      slug: PARAMS.slug,
      season: 2,
      episode: 5,
    });
  });

  it('returns no crawler data on the server for a human', async () => {
    environment.browser = false;
    const { result } = runLoad({ isCrawler: false });

    expect(await result).toEqual({ crawlerShow: null, crawlerEpisode: null });
    expect(crawler.fetchShow).not.toHaveBeenCalled();
    expect(crawler.fetchEpisode).not.toHaveBeenCalled();
  });
});
