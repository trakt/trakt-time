import { peopleSummaryQuery } from '$lib/requests/queries/people/peopleSummaryQuery.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.ts';

const environment = vi.hoisted(() => ({ browser: true }));

vi.mock('$app/environment', () => environment);

const SLUG = 'some-slug';

function runLoad(data: Record<string, unknown>) {
  const prefetchQuery = vi.fn(() => new Promise<void>(() => {}));
  const result = load({
    data,
    params: { slug: SLUG },
    parent: () => Promise.resolve({ queryClient: { prefetchQuery } }),
  } as unknown as Parameters<typeof load>[0]);

  return { prefetchQuery, result };
}

describe('person page load', () => {
  beforeEach(() => {
    environment.browser = true;
  });

  it('prefetches the summary with the key the page uses', async () => {
    const { prefetchQuery, result } = runLoad({});

    await result;

    expect(prefetchQuery).toHaveBeenCalledOnce();
    const [options] = prefetchQuery.mock.calls[0] as unknown as [
      { queryKey: readonly unknown[] },
    ];
    expect(options.queryKey).toEqual(
      peopleSummaryQuery({ slug: SLUG }).queryKey,
    );
  });

  it('does not wait for the prefetch to finish', async () => {
    const { result } = runLoad({});

    await expect(result).resolves.toBeDefined();
  });

  it('returns the server data untouched', async () => {
    const data = { crawlerPerson: { id: 1 } };
    const { result } = runLoad(data);

    expect(await result).toBe(data);
  });

  it('does not prefetch outside the browser', async () => {
    environment.browser = false;
    const { prefetchQuery, result } = runLoad({});

    await result;

    expect(prefetchQuery).not.toHaveBeenCalled();
  });
});
