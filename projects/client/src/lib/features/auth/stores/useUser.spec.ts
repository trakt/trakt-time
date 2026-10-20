import { BehaviorSubject, type Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUser } from './useUser.ts';

const { queries } = vi.hoisted(() => ({
  queries: { value: [] as Array<BehaviorSubject<unknown>>, call: 0 },
}));

vi.mock('$lib/features/query/useQuery.ts', () => ({
  useQuery: () => queries.value[queries.call++],
}));
vi.mock('./useAuth.ts', () => ({
  useAuth: () => ({ isAuthorized: of(true) }),
}));
vi.mock('./useCurrentUserHistory.ts', () => ({
  useCurrentUserHistory: () => ({ history: of(null) }),
}));

const SLICES = [
  'user',
  'watchlist',
  'ratings',
  'reactions',
  'favorites',
  'network',
  'plexLibrary',
  'likes',
  'limits',
  'notes',
  'dropped',
  'blocked',
] as const;

describe('useUser', () => {
  beforeEach(() => {
    queries.call = 0;
    queries.value = SLICES.map(
      (slice) =>
        new BehaviorSubject<unknown>({
          data: slice === 'blocked' ? [{ slug: 'a' }] : { slice },
          isFetching: false,
        }),
    );
  });

  it.each(SLICES.map((slice, index) => [slice, index] as const))(
    'should emit %s once when only the fetch status changes',
    (slice, index) => {
      const user = useUser();
      const emissions: unknown[] = [];
      (user[slice] as Observable<unknown>).subscribe((value) =>
        emissions.push(value),
      );

      const { data } = queries.value[index].value as { data: unknown };
      queries.value[index].next({ data, isFetching: true });
      queries.value[index].next({ data, isFetching: false });

      expect(emissions).toHaveLength(1);
    },
  );

  it('should emit again when the data reference changes', () => {
    const { watchlist } = useUser();
    const emissions: unknown[] = [];
    watchlist.subscribe((value) => emissions.push(value));

    queries.value[1].next({ data: { next: true }, isFetching: false });

    expect(emissions).toHaveLength(2);
  });
});
