import { showSummaryQuery } from '$lib/requests/queries/shows/showSummaryQuery.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.ts';

const environment = vi.hoisted(() => ({ browser: true }));
const crawler = vi.hoisted(() => ({ fetchForCrawler: vi.fn() }));

vi.mock('$app/environment', () => environment);
vi.mock('$lib/features/seo/requests/fetchShowForCrawler.ts', () => ({
  fetchShowForCrawler: crawler.fetchForCrawler,
}));

const SLUG = 'some-slug';

function runLoad({ isCrawler = false }: { isCrawler?: boolean } = {}) {
  const prefetchQuery = vi.fn(() => new Promise<void>(() => {}));
  const fetch = vi.fn();
  const result = load({
    fetch,
    params: { slug: SLUG },
    parent: () =>
      Promise.resolve({ queryClient: { prefetchQuery }, isCrawler }),
  } as unknown as Parameters<typeof load>[0]);

  return { fetch, prefetchQuery, result };
}

describe('show page load', () => {
  beforeEach(() => {
    environment.browser = true;
    crawler.fetchForCrawler.mockReset();
  });

  it('prefetches the summary with the key the page uses', async () => {
    const { prefetchQuery, result } = runLoad();

    await result;

    expect(prefetchQuery).toHaveBeenCalledOnce();
    const [options] = prefetchQuery.mock.calls[0] as unknown as [
      { queryKey: readonly unknown[] },
    ];
    expect(options.queryKey).toEqual(showSummaryQuery({ slug: SLUG }).queryKey);
  });

  it('does not wait for the prefetch to finish', async () => {
    const { result } = runLoad();

    await expect(result).resolves.toBeDefined();
  });

  it('returns no crawler data in the browser without fetching it', async () => {
    const { result } = runLoad({ isCrawler: true });

    expect(await result).toEqual({ crawlerShow: null });
    expect(crawler.fetchForCrawler).not.toHaveBeenCalled();
  });

  it('does not prefetch outside the browser', async () => {
    environment.browser = false;
    const { prefetchQuery, result } = runLoad();

    await result;

    expect(prefetchQuery).not.toHaveBeenCalled();
  });

  it('fetches the crawler data on the server for a crawler', async () => {
    environment.browser = false;
    const entry = { id: 1 };
    crawler.fetchForCrawler.mockResolvedValue(entry);
    const { fetch, result } = runLoad({ isCrawler: true });

    expect(await result).toEqual({ crawlerShow: entry });
    expect(crawler.fetchForCrawler).toHaveBeenCalledWith({
      fetch,
      slug: SLUG,
    });
  });

  it('returns no crawler data on the server for a human', async () => {
    environment.browser = false;
    const { result } = runLoad({ isCrawler: false });

    expect(await result).toEqual({ crawlerShow: null });
    expect(crawler.fetchForCrawler).not.toHaveBeenCalled();
  });
});
