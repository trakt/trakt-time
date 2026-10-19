import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaginatedListQuery } from './usePaginatedListQuery.ts';

const { query } = vi.hoisted(() => ({
  query: { value: null as unknown },
}));

vi.mock('$lib/features/query/useQuery.ts', () => ({
  useInfiniteQuery: () => query.value,
}));

type Entry = { key: string };

function result(
  data: { pages: Array<{ entries: Entry[] }> } | undefined,
  isFetchingNextPage = false,
) {
  return {
    data,
    isFetchingNextPage,
    isPending: false,
    isFetching: isFetchingNextPage,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

function start(source: BehaviorSubject<unknown>) {
  query.value = source;
  const { list } = usePaginatedListQuery(
    {} as Parameters<typeof usePaginatedListQuery>[0],
  );
  const emissions: Entry[][] = [];
  list.subscribe((value) => emissions.push(value as Entry[]));
  return emissions;
}

describe('usePaginatedListQuery', () => {
  const data = {
    pages: [
      { entries: [{ key: 'a' }, { key: 'b' }] },
      { entries: [{ key: 'b' }, { key: 'c' }] },
    ],
  };

  beforeEach(() => {
    query.value = null;
  });

  it('should dedupe entries across pages', () => {
    const emissions = start(new BehaviorSubject<unknown>(result(data)));

    expect(emissions[0].map((entry) => entry.key)).toEqual(['a', 'b', 'c']);
  });

  it('should emit once when only the fetch status changes', () => {
    const source = new BehaviorSubject<unknown>(result(data));
    const emissions = start(source);

    source.next(result(data, true));
    source.next(result(data, false));

    expect(emissions).toHaveLength(1);
  });

  it('should emit again when the data reference changes', () => {
    const source = new BehaviorSubject<unknown>(result(data));
    const emissions = start(source);

    source.next(result({ pages: [{ entries: [{ key: 'z' }] }] }));

    expect(emissions).toHaveLength(2);
  });

  it('should emit an empty list while there is no data', () => {
    const emissions = start(new BehaviorSubject<unknown>(result(undefined)));

    expect(emissions).toEqual([[]]);
  });
});
