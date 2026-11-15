import { actionToastStore } from '$lib/features/action-toast/_internal/actionToastStore.ts';
import type { ActionToast } from '$lib/features/action-toast/models/ActionToast.ts';
import type { AddToListResult } from '$lib/requests/queries/users/addToListRequest.ts';
import { addToListRequest } from '$lib/requests/queries/users/addToListRequest.ts';
import type { UserList } from '$lib/requests/queries/users/userListsQuery.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useList } from './useList.ts';

vi.mock('$lib/requests/queries/users/addToListRequest.ts', () => ({
  addToListRequest: vi.fn(),
}));

vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track: vi.fn() }),
}));

vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate: vi.fn() }),
}));

const list = { id: 7, ownerId: 1, name: 'Favorites' } as unknown as UserList;

function currentToast() {
  let value = null as ActionToast | null;
  actionToastStore
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return value;
}

async function addWith(result: AddToListResult) {
  vi.mocked(addToListRequest).mockResolvedValue(result);
  const { addToList } = useList({ list, type: 'movie', media: { id: 3 } });

  return addToList();
}

describe('useList', () => {
  beforeEach(() => {
    actionToastStore.dismiss();
  });

  it('should report an added title without a toast', async () => {
    expect(await addWith({ status: 'added' })).toBe(true);
    expect(currentToast()).toBeNull();
  });

  it('should explain a full list with an error toast', async () => {
    expect(
      await addWith({ status: 'list-full', limit: 100, isVip: false }),
    ).toBe(false);
    expect(currentToast()).toMatchObject({
      variant: 'error',
      message: expect.stringContaining('This list is full at 100 items'),
    });
  });

  it('should explain full lists with an error toast', async () => {
    expect(
      await addWith({ status: 'lists-full', limit: 500, isVip: true }),
    ).toBe(false);
    expect(currentToast()).toMatchObject({
      variant: 'error',
      message: expect.stringContaining('Your lists are full'),
    });
  });

  it('should refuse silently on a plain failure', async () => {
    expect(await addWith({ status: 'failed' })).toBe(false);
    expect(currentToast()).toBeNull();
  });

  it('should not add an episode', async () => {
    const { addToList } = useList({
      list,
      type: 'episode',
      media: { id: 3, season: 1, number: 2 },
    });

    expect(await addToList()).toBe(false);
    expect(addToListRequest).not.toHaveBeenCalled();
  });
});
