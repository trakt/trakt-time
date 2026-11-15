import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CheckInAction from './CheckInAction.svelte';

const checkin = vi.fn();

vi.mock('./useCheckIn.ts', () => ({
  useCheckIn: () => ({
    checkin,
    isCheckingIn: new BehaviorSubject(false),
    isCheckedIn: new BehaviorSubject(false),
    isWatchable: true,
  }),
}));

function renderAction(onCheckIn: () => void) {
  render(CheckInAction, {
    style: 'normal',
    title: 'Heretic',
    type: 'movie',
    media: { id: 1 },
    onCheckIn,
  } as never);
}

describe('component: CheckInAction', () => {
  beforeEach(() => {
    checkin.mockReset();
  });

  afterEach(cleanup);

  it('should run onCheckIn after a successful check in', async () => {
    checkin.mockResolvedValue(true);
    const onCheckIn = vi.fn();
    renderAction(onCheckIn);

    screen.getByRole('button').click();

    await waitFor(() => expect(onCheckIn).toHaveBeenCalledOnce());
  });

  it('should not run onCheckIn after a failed check in', async () => {
    checkin.mockResolvedValue(false);
    const onCheckIn = vi.fn();
    renderAction(onCheckIn);

    screen.getByRole('button').click();

    await waitFor(() => expect(checkin).toHaveBeenCalledOnce());
    await Promise.resolve();
    expect(onCheckIn).not.toHaveBeenCalled();
  });
});
