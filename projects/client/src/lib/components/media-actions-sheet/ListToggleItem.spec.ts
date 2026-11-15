import type { UserList } from '$lib/requests/queries/users/userListsQuery.ts';
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListToggleItem from './ListToggleItem.svelte';

const addToList = vi.fn();
const removeFromList = vi.fn();

vi.mock('$lib/sections/components/lists-drawer/useList.ts', () => ({
  useList: () => ({
    addToList,
    removeFromList,
    isListUpdating: new BehaviorSubject(false),
  }),
}));

const list = { id: 7, name: 'Favorites', count: 3 } as unknown as UserList;

describe('component: ListToggleItem', () => {
  beforeEach(() => {
    addToList.mockReset();
    removeFromList.mockReset();
  });

  afterEach(cleanup);

  it('should show the row as added while the request is pending', async () => {
    addToList.mockReturnValue(new Promise(() => {}));
    render(ListToggleItem, { list, type: 'movie', id: 3, isAdded: false });

    screen.getByRole('button').click();

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
  });

  it('should keep the row added once the request succeeds', async () => {
    addToList.mockResolvedValue(true);
    render(ListToggleItem, { list, type: 'movie', id: 3, isAdded: false });

    screen.getByRole('button').click();

    await waitFor(() => expect(addToList).toHaveBeenCalledOnce());
    expect(removeFromList).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show the row as not added once the request is refused', async () => {
    addToList.mockResolvedValue(false);
    render(ListToggleItem, { list, type: 'movie', id: 3, isAdded: false });

    screen.getByRole('button').click();

    await waitFor(() => expect(addToList).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-pressed',
        'false',
      ),
    );
  });

  it('should remove a listed title instead of adding it', async () => {
    render(ListToggleItem, { list, type: 'movie', id: 3, isAdded: true });

    screen.getByRole('button').click();

    await waitFor(() => expect(removeFromList).toHaveBeenCalledOnce());
    expect(addToList).not.toHaveBeenCalled();
  });
});
