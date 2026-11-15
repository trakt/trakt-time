import { actionToastStore } from '$lib/features/action-toast/_internal/actionToastStore.ts';
import type { ActionToast } from '$lib/features/action-toast/models/ActionToast.ts';
import { checkinMovieRequest } from '$lib/requests/queries/checkin/checkinMovieRequest.ts';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckIn } from './useCheckIn.ts';

const invalidate = vi.fn();

vi.mock('$lib/requests/queries/checkin/checkinMovieRequest.ts', () => ({
  checkinMovieRequest: vi.fn(),
}));

vi.mock('$lib/requests/queries/checkin/checkinEpisodeRequest.ts', () => ({
  checkinEpisodeRequest: vi.fn(),
}));

vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track: vi.fn() }),
}));

vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate }),
}));

vi.mock('$lib/features/toast/useNowPlaying.ts', () => ({
  useNowPlaying: () => ({ nowPlaying: new BehaviorSubject(null) }),
}));

function currentToast() {
  let value = null as ActionToast | null;
  actionToastStore
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return value;
}

function isCheckingIn(store: BehaviorSubject<boolean>) {
  return store.value;
}

function movieCheckIn() {
  return useCheckIn({
    type: 'movie',
    media: { id: 1, effectiveReleaseDate: new Date('2020-01-01T00:00:00Z') },
  } as unknown as Parameters<typeof useCheckIn>[0]);
}

describe('useCheckIn', () => {
  beforeEach(() => {
    actionToastStore.dismiss();
    vi.mocked(checkinMovieRequest).mockReset();
    invalidate.mockReset();
  });

  it('should report a successful check in without a toast', async () => {
    vi.mocked(checkinMovieRequest).mockResolvedValue(true);
    const { checkin, isCheckingIn: checkingIn } = movieCheckIn();

    expect(await checkin()).toBe(true);
    expect(currentToast()).toBeNull();
    expect(isCheckingIn(checkingIn as BehaviorSubject<boolean>)).toBe(false);
    expect(invalidate).toHaveBeenCalledOnce();
  });

  it('should explain a failed check in with an error toast', async () => {
    vi.mocked(checkinMovieRequest).mockRejectedValue(new Error('offline'));
    const { checkin } = movieCheckIn();

    expect(await checkin()).toBe(false);
    expect(currentToast()).toMatchObject({
      message: "Couldn't check in",
      variant: 'error',
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('should stop checking in after a failure', async () => {
    vi.mocked(checkinMovieRequest).mockRejectedValue(new Error('offline'));
    const { checkin, isCheckingIn: checkingIn } = movieCheckIn();

    await checkin();

    expect(isCheckingIn(checkingIn as BehaviorSubject<boolean>)).toBe(false);
  });
});
