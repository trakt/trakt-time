import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavorites } from './useFavorites.ts';

type Favorites = { movies: Set<number>; shows: Set<number> };

const state = vi.hoisted(() => ({
  client: {} as object,
  favorites: undefined as unknown as BehaviorSubject<Favorites>,
  addRequest: undefined as unknown as () => Promise<boolean>,
  removeRequest: undefined as unknown as () => Promise<boolean>,
  invalidate: undefined as unknown as () => Promise<void>,
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/features/query/_internal/queryClientContext.ts', () => ({
  useQueryClient: () => state.client,
}));
vi.mock('$lib/features/auth/stores/useUser.ts', () => ({
  useUser: () => ({ favorites: state.favorites }),
}));
vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate: () => state.invalidate() }),
}));
vi.mock('$lib/requests/sync/addToFavoritesRequest.ts', () => ({
  addToFavoritesRequest: () => state.addRequest(),
}));
vi.mock('$lib/requests/sync/removeFromFavoritesRequest.ts', () => ({
  removeFromFavoritesRequest: () => state.removeRequest(),
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

const props = { type: 'movie', id: 7, title: 'Movie' } as const;

describe('useFavorites pending state', () => {
  beforeEach(() => {
    state.client = {};
    state.favorites = new BehaviorSubject<Favorites>({
      movies: new Set(),
      shows: new Set(),
    });
    state.invalidate = () => Promise.resolve();
  });

  it('should show as favorited the moment an add starts and clear on success', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    state.invalidate = () => {
      state.favorites.next({ movies: new Set([7]), shows: new Set() });
      return Promise.resolve();
    };
    const { isFavorited, isUpdatingFavorite, addToFavorites } =
      useFavorites(props);

    const addition = addToFavorites();

    expect(await firstValueFrom(isFavorited)).toBe(true);
    expect(await firstValueFrom(isUpdatingFavorite)).toBe(true);

    request.resolve(true);
    await addition;

    expect(await firstValueFrom(isUpdatingFavorite)).toBe(false);
    expect(await firstValueFrom(isFavorited)).toBe(true);
  });

  it('should show as not favorited the moment a removal starts', async () => {
    state.favorites.next({ movies: new Set([7]), shows: new Set() });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;
    const { isFavorited, isUpdatingFavorite, removeFromFavorites } =
      useFavorites(props);

    expect(await firstValueFrom(isFavorited)).toBe(true);

    const removal = removeFromFavorites();

    expect(await firstValueFrom(isFavorited)).toBe(false);
    expect(await firstValueFrom(isUpdatingFavorite)).toBe(true);

    request.resolve(true);
    await removal;
  });

  it('should roll back when the request reports a non-success status', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isFavorited, isUpdatingFavorite, addToFavorites } =
      useFavorites(props);

    const addition = addToFavorites();
    expect(await firstValueFrom(isFavorited)).toBe(true);

    request.resolve(false);
    await addition;

    expect(await firstValueFrom(isFavorited)).toBe(false);
    expect(await firstValueFrom(isUpdatingFavorite)).toBe(false);
  });

  it('should clear and roll back when the request throws', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;
    const { isFavorited, isUpdatingFavorite, addToFavorites } =
      useFavorites(props);

    const addition = addToFavorites();
    expect(await firstValueFrom(isFavorited)).toBe(true);

    request.reject(new Error('offline'));
    await expect(addition).rejects.toThrow('offline');

    expect(await firstValueFrom(isFavorited)).toBe(false);
    expect(await firstValueFrom(isUpdatingFavorite)).toBe(false);
  });

  it('should survive the hook being created again for the same media', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useFavorites(props).addToFavorites();
    const recreated = useFavorites(props);

    expect(await firstValueFrom(recreated.isFavorited)).toBe(true);
    expect(await firstValueFrom(recreated.isUpdatingFavorite)).toBe(true);

    request.resolve(false);
    await addition;

    expect(await firstValueFrom(recreated.isFavorited)).toBe(false);
    expect(await firstValueFrom(recreated.isUpdatingFavorite)).toBe(false);
  });

  it('should not leak the pending state into another query client', async () => {
    const request = deferred<boolean>();
    state.addRequest = () => request.promise;

    const addition = useFavorites(props).addToFavorites();
    state.client = {};
    const other = useFavorites(props);

    expect(await firstValueFrom(other.isFavorited)).toBe(false);
    expect(await firstValueFrom(other.isUpdatingFavorite)).toBe(false);

    request.resolve(true);
    await addition;
  });

  it('should keep add and remove intents apart', async () => {
    state.favorites.next({ movies: new Set([7]), shows: new Set() });
    const request = deferred<boolean>();
    state.removeRequest = () => request.promise;

    const removal = useFavorites(props).removeFromFavorites();
    const other = useFavorites(props);

    expect(await firstValueFrom(other.isFavorited)).toBe(false);

    request.resolve(true);
    await removal;

    expect(await firstValueFrom(other.isFavorited)).toBe(true);
  });
});
