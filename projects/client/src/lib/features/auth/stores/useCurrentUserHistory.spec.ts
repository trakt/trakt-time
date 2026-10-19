import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCurrentUserHistory } from './useCurrentUserHistory.ts';

const { queries } = vi.hoisted(() => ({
  queries: { value: [] as Array<BehaviorSubject<unknown>>, call: 0 },
}));

vi.mock('$lib/features/query/useQuery.ts', () => ({
  useInfiniteQuery: () => queries.value[queries.call++],
}));

type FakeQuery = {
  data: { pages: Array<{ entries: Array<{ id: number }> }> } | undefined;
  isPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

function settled(data: FakeQuery['data']): FakeQuery {
  return {
    data,
    isPending: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

describe('useCurrentUserHistory', () => {
  const moviesData = { pages: [{ entries: [{ id: 1 }] }] };
  const showsData = { pages: [{ entries: [{ id: 2 }] }] };

  beforeEach(() => {
    queries.call = 0;
    queries.value = [
      new BehaviorSubject<unknown>(settled(moviesData)),
      new BehaviorSubject<unknown>(settled(showsData)),
    ];
  });

  it('should build the lookup maps from the settled data', () => {
    const { history } = useCurrentUserHistory();
    const emissions: unknown[] = [];
    history.subscribe((value) => emissions.push(value));

    const [{ movies, shows }] = emissions as Array<{
      movies: Map<number, unknown>;
      shows: Map<number, unknown>;
    }>;

    expect([...movies.keys()]).toEqual([1]);
    expect([...shows.keys()]).toEqual([2]);
  });

  it('should emit once when only the fetch status changes', () => {
    const { history } = useCurrentUserHistory();
    const emissions: unknown[] = [];
    history.subscribe((value) => emissions.push(value));

    queries.value[0].next({ ...settled(moviesData), hasNextPage: true });
    queries.value[1].next({ ...settled(showsData), hasNextPage: true });

    expect(emissions).toHaveLength(1);
  });

  it('should emit again when a data reference changes', () => {
    const { history } = useCurrentUserHistory();
    const emissions: unknown[] = [];
    history.subscribe((value) => emissions.push(value));

    queries.value[0].next(
      settled({ pages: [{ entries: [{ id: 1 }, { id: 3 }] }] }),
    );

    expect(emissions).toHaveLength(2);
  });

  it('should emit null once while a query is not settled', () => {
    const { history } = useCurrentUserHistory();
    const emissions: unknown[] = [];
    history.subscribe((value) => emissions.push(value));

    queries.value[0].next({ ...settled(moviesData), isPending: true });
    queries.value[0].next({
      ...settled(moviesData),
      isPending: true,
      isFetchingNextPage: true,
    });

    expect(emissions.slice(1)).toEqual([null]);
  });
});
