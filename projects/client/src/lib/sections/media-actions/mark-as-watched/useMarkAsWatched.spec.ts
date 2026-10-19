import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarkAsWatched } from './useMarkAsWatched.ts';

type History = { movies: Set<number>; shows: Map<number, unknown> };

const state = vi.hoisted(() => ({
  client: {} as object,
  history: undefined as unknown as BehaviorSubject<History>,
  addRequest: undefined as unknown as () => Promise<boolean>,
  removeRequest: undefined as unknown as () => Promise<boolean>,
  invalidate: undefined as unknown as () => Promise<void>,
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/features/query/_internal/queryClientContext.ts', () => ({
  useQueryClient: () => state.client,
}));
vi.mock('$lib/features/auth/stores/useUser.ts', async () => {
  const { BehaviorSubject } = await import('rxjs');

  return {
    useUser: () => ({
      user: new BehaviorSubject({ id: 1 }),
      history: state.history,
      ratings: new BehaviorSubject({}),
    }),
  };
});
vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track: vi.fn() }),
}));
vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate: () => state.invalidate() }),
}));
vi.mock('$lib/requests/sync/markAsWatchedRequest.ts', () => ({
  markAsWatchedRequest: () => state.addRequest(),
}));
vi.mock('$lib/requests/sync/removeWatchedRequest.ts', () => ({
  removeWatchedRequest: () => state.removeRequest(),
}));
vi.mock('./findOrphanedRatingIds.ts', () => ({
  findOrphanedRatingIds: () => [],
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

const effectiveReleaseDate = new Date('2000-01-01');
const movie = {
  type: 'movie',
  media: { id: 7, effectiveReleaseDate },
} as const;
const show = {
  type: 'show',
  media: { id: 9, effectiveReleaseDate },
} as const;

describe('useMarkAsWatched pending state', () => {
  beforeEach(() => {
    state.client = {};
    state.history = new BehaviorSubject<History>({
      movies: new Set(),
      shows: new Map(),
    });
    state.invalidate = () => Promise.resolve();
  });

  it('should show as watched the moment a movie add starts and clear on success', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    state.invalidate = () => {
      state.history.next({ movies: new Set([7]), shows: new Map() });
      return Promise.resolve();
    };
    const { isWatched, isMarkingAsWatched, markAsWatched } =
      useMarkAsWatched(movie);

    const addition = markAsWatched();
    await Promise.resolve();

    expect(await firstValueFrom(isWatched)).toBe(true);
    expect(await firstValueFrom(isMarkingAsWatched)).toBe(true);

    request.resolve(true);
    expect(await addition).toBe(true);

    expect(await firstValueFrom(isMarkingAsWatched)).toBe(false);
    expect(await firstValueFrom(isWatched)).toBe(true);
  });

  it('should show as unwatched the moment a removal starts', async () => {
    state.history.next({ movies: new Set([7]), shows: new Map() });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;
    const { isWatched, isMarkingAsWatched, removeWatched } =
      useMarkAsWatched(movie);

    expect(await firstValueFrom(isWatched)).toBe(true);

    const removal = removeWatched();

    expect(await firstValueFrom(isWatched)).toBe(false);
    expect(await firstValueFrom(isMarkingAsWatched)).toBe(true);

    request.resolve(true);
    await removal;
  });

  it('should not predict a show as watched while an add is pending', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isWatched, isMarkingAsWatched, markAsWatched } =
      useMarkAsWatched(show);

    const addition = markAsWatched();
    await Promise.resolve();

    expect(await firstValueFrom(isWatched)).toBe(false);
    expect(await firstValueFrom(isMarkingAsWatched)).toBe(true);

    request.resolve(true);
    await addition;
  });

  it('should predict a show as unwatched while a removal is pending', async () => {
    state.history.next({ movies: new Set(), shows: new Map([[9, {}]]) });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;
    const { isWatched, removeWatched } = useMarkAsWatched(show);

    const removal = removeWatched();

    expect(await firstValueFrom(isWatched)).toBe(false);

    request.resolve(true);
    await removal;
  });

  it('should roll back when the request reports a non-success status', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isWatched, isMarkingAsWatched, markAsWatched } =
      useMarkAsWatched(movie);

    const addition = markAsWatched();
    await Promise.resolve();
    expect(await firstValueFrom(isWatched)).toBe(true);

    request.resolve(false);
    expect(await addition).toBe(false);

    expect(await firstValueFrom(isWatched)).toBe(false);
    expect(await firstValueFrom(isMarkingAsWatched)).toBe(false);
  });

  it('should clear and roll back when the request throws', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isWatched, isMarkingAsWatched, markAsWatched } =
      useMarkAsWatched(movie);

    const addition = markAsWatched();
    await Promise.resolve();
    expect(await firstValueFrom(isWatched)).toBe(true);

    request.reject(new Error('offline'));
    await expect(addition).rejects.toThrow('offline');

    expect(await firstValueFrom(isWatched)).toBe(false);
    expect(await firstValueFrom(isMarkingAsWatched)).toBe(false);
  });

  it('should survive the hook being created again for the same media', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useMarkAsWatched(movie).markAsWatched();
    await Promise.resolve();
    const recreated = useMarkAsWatched(movie);

    expect(await firstValueFrom(recreated.isWatched)).toBe(true);
    expect(await firstValueFrom(recreated.isMarkingAsWatched)).toBe(true);

    request.resolve(false);
    await addition;

    expect(await firstValueFrom(recreated.isWatched)).toBe(false);
    expect(await firstValueFrom(recreated.isMarkingAsWatched)).toBe(false);
  });

  it('should not leak the pending state into another query client', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useMarkAsWatched(movie).markAsWatched();
    await Promise.resolve();
    state.client = {};
    const other = useMarkAsWatched(movie);

    expect(await firstValueFrom(other.isWatched)).toBe(false);
    expect(await firstValueFrom(other.isMarkingAsWatched)).toBe(false);

    request.resolve(true);
    await addition;
  });

  it('should keep add and remove intents apart', async () => {
    state.history.next({ movies: new Set([7]), shows: new Map() });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;

    const removal = useMarkAsWatched(movie).removeWatched();
    const other = useMarkAsWatched(movie);

    expect(await firstValueFrom(other.isWatched)).toBe(false);

    request.resolve(true);
    await removal;

    expect(await firstValueFrom(other.isWatched)).toBe(true);
  });
});
