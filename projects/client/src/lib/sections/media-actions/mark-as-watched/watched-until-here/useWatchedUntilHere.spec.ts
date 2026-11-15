import { actionToastStore } from '$lib/features/action-toast/_internal/actionToastStore.ts';
import type { ActionToast } from '$lib/features/action-toast/models/ActionToast.ts';
import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { Season } from '$lib/requests/models/Season.ts';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWatchedUntilHere } from './useWatchedUntilHere.ts';

const authorized = new BehaviorSubject(true);
const markEpisodesAsWatched = vi.fn();
const resolveWatched = vi.fn();
const fetchSeasonEpisodes = vi.fn();

vi.mock('$lib/features/auth/stores/useAuth.ts', () => ({
  useAuth: () => ({ isAuthorized: authorized }),
}));

vi.mock('../_internal/useShowEpisodeHistory.ts', () => ({
  useShowEpisodeHistory: () => ({
    resolveWatched,
    fetchSeasonEpisodes,
    markEpisodesAsWatched,
  }),
}));

const aired = new Date('2020-01-01T00:00:00Z');

const episode = (number: number) =>
  ({
    id: number,
    number,
    season: 1,
    title: `Episode ${number}`,
    effectiveReleaseDate: aired,
  }) as EpisodeEntry;

const seasons = [{ number: 1, episodes: { count: 3 } }] as Season[];

function currentToast() {
  let value = null as ActionToast | null;
  actionToastStore
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return value;
}

function offer(watchedIds: number[], target = 3) {
  resolveWatched.mockResolvedValue({
    watchedEpisodeIds: new Set(watchedIds),
    watchedCountBySeason: new Map([[1, watchedIds.length]]),
  });
  const { offerWatchedUntilHere, dispose } = useWatchedUntilHere({
    slug: 'show',
    showId: 1,
  });

  return {
    dispose,
    run: () =>
      offerWatchedUntilHere({
        episode: episode(target),
        currentSeasonEpisodes: [episode(1), episode(2), episode(3)],
        seasons,
      }),
  };
}

describe('useWatchedUntilHere', () => {
  beforeEach(() => {
    actionToastStore.dismiss();
    authorized.next(true);
    vi.clearAllMocks();
  });

  it('should offer a ten second toast when earlier episodes are unwatched', async () => {
    await offer([3]).run();

    expect(currentToast()).toMatchObject({
      durationMs: 10_000,
      action: { text: 'Watched until here' },
    });
  });

  it('should not offer anything when no earlier episode is unwatched', async () => {
    await offer([1, 2, 3]).run();

    expect(currentToast()).toBeNull();
  });

  it('should not offer anything when signed out', async () => {
    authorized.next(false);

    await offer([3]).run();

    expect(currentToast()).toBeNull();
  });

  it('should fill the skipped episodes when the action runs', async () => {
    fetchSeasonEpisodes.mockResolvedValue([episode(1), episode(2), episode(3)]);

    await offer([3]).run();
    await currentToast()?.action?.onAction();

    expect(markEpisodesAsWatched).toHaveBeenCalledWith({
      ids: [1, 2],
      watchedAt: 'released',
    });
  });

  it('should dismiss its toast on dispose', async () => {
    const { run, dispose } = offer([3]);
    await run();

    dispose();

    expect(currentToast()).toBeNull();
  });

  it('should keep a newer toast on dispose', async () => {
    const { run, dispose } = offer([3]);
    await run();
    actionToastStore.notify({ message: 'newer' });

    dispose();

    expect(currentToast()?.message).toBe('newer');
  });

  it('should not offer after dispose', async () => {
    const { run, dispose } = offer([3]);

    dispose();
    await run();

    expect(currentToast()).toBeNull();
  });
});
