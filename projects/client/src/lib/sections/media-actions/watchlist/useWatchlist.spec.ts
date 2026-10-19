import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWatchlist } from './useWatchlist.ts';

type Watchlist = { movies: Set<number>; shows: Set<number> };

const state = vi.hoisted(() => ({
  client: {} as object,
  watchlist: undefined as unknown as BehaviorSubject<Watchlist>,
  addRequest: undefined as unknown as () => Promise<boolean>,
  removeRequest: undefined as unknown as () => Promise<boolean>,
  invalidate: undefined as unknown as () => Promise<void>,
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/features/query/_internal/queryClientContext.ts', () => ({
  useQueryClient: () => state.client,
}));
vi.mock('$lib/features/auth/stores/useUser.ts', () => ({
  useUser: () => ({ watchlist: state.watchlist }),
}));
vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track: vi.fn() }),
}));
vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate: () => state.invalidate() }),
}));
vi.mock('$lib/requests/sync/addToWatchlistRequest.ts', () => ({
  addToWatchlistRequest: () => state.addRequest(),
}));
vi.mock('$lib/requests/sync/removeFromWatchlistRequest.ts', () => ({
  removeFromWatchlistRequest: () => state.removeRequest(),
}));

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const props = { type: 'show', media: { id: 7 } } as const;

describe('useWatchlist pending state', () => {
  beforeEach(() => {
    state.client = {};
    state.watchlist = new BehaviorSubject<Watchlist>({
      movies: new Set(),
      shows: new Set(),
    });
    state.invalidate = () => Promise.resolve();
  });

  it('should show as watchlisted the moment an add starts and clear on success', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    state.invalidate = () => {
      state.watchlist.next({ movies: new Set(), shows: new Set([7]) });
      return Promise.resolve();
    };
    const { isWatchlisted, isWatchlistUpdating, addToWatchlist } =
      useWatchlist(props);

    const addition = addToWatchlist();

    expect(await firstValueFrom(isWatchlisted)).toBe(true);
    expect(await firstValueFrom(isWatchlistUpdating)).toBe(true);

    request.resolve(true);
    await addition;

    expect(await firstValueFrom(isWatchlistUpdating)).toBe(false);
    expect(await firstValueFrom(isWatchlisted)).toBe(true);
  });

  it('should show as not watchlisted the moment a remove starts', async () => {
    state.watchlist.next({ movies: new Set(), shows: new Set([7]) });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;
    const { isWatchlisted, isWatchlistUpdating, removeFromWatchlist } =
      useWatchlist(props);

    expect(await firstValueFrom(isWatchlisted)).toBe(true);

    const removal = removeFromWatchlist();

    expect(await firstValueFrom(isWatchlisted)).toBe(false);
    expect(await firstValueFrom(isWatchlistUpdating)).toBe(true);

    request.resolve(true);
    await removal;
  });

  it('should roll back when the request reports a non-success status', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isWatchlisted, isWatchlistUpdating, addToWatchlist } =
      useWatchlist(props);

    const addition = addToWatchlist();
    expect(await firstValueFrom(isWatchlisted)).toBe(true);

    request.resolve(false);
    await addition;

    expect(await firstValueFrom(isWatchlisted)).toBe(false);
    expect(await firstValueFrom(isWatchlistUpdating)).toBe(false);
  });

  it('should clear and roll back when the request throws', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isWatchlisted, isWatchlistUpdating, addToWatchlist } =
      useWatchlist(props);

    const addition = addToWatchlist();
    expect(await firstValueFrom(isWatchlisted)).toBe(true);

    request.reject(new Error('offline'));
    await expect(addition).rejects.toThrow('offline');

    expect(await firstValueFrom(isWatchlisted)).toBe(false);
    expect(await firstValueFrom(isWatchlistUpdating)).toBe(false);
  });

  it('should survive the hook being created again for the same media', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useWatchlist(props).addToWatchlist();
    const recreated = useWatchlist(props);

    expect(await firstValueFrom(recreated.isWatchlisted)).toBe(true);
    expect(await firstValueFrom(recreated.isWatchlistUpdating)).toBe(true);

    request.resolve(false);
    await addition;

    expect(await firstValueFrom(recreated.isWatchlisted)).toBe(false);
    expect(await firstValueFrom(recreated.isWatchlistUpdating)).toBe(false);
  });

  it('should not leak the pending state into another query client', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useWatchlist(props).addToWatchlist();
    state.client = {};
    const other = useWatchlist(props);

    expect(await firstValueFrom(other.isWatchlisted)).toBe(false);
    expect(await firstValueFrom(other.isWatchlistUpdating)).toBe(false);

    request.resolve(true);
    await addition;
  });

  it('should ignore episodes', async () => {
    const request = vi.fn(() => Promise.resolve(true));
    state.addRequest = request;
    const { isWatchlistUpdating, addToWatchlist } = useWatchlist({
      type: 'episode',
      media: { id: 1, season: 1, number: 1 },
      show: { id: 2, title: 'Show' },
    });

    await addToWatchlist();

    expect(request).not.toHaveBeenCalled();
    expect(await firstValueFrom(isWatchlistUpdating)).toBe(false);
  });
});
