import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VipSubscribe from './VipSubscribe.svelte';

const startCheckout = vi.fn();

vi.mock('./_internal/useVip.ts', () => ({
  useVip: () => ({
    plans: new BehaviorSubject([]),
    startCheckout,
    isFetching: new BehaviorSubject(false),
  }),
}));

vi.mock('$lib/features/auth/stores/useUser.ts', () => ({
  useUser: () => ({ user: new BehaviorSubject({ slug: 'me' }) }),
}));

describe('component: VipSubscribe', () => {
  beforeEach(() => {
    startCheckout.mockReset();
  });

  afterEach(cleanup);

  it('should explain a checkout that rejects', async () => {
    startCheckout.mockRejectedValue(new Error('offline'));
    render(VipSubscribe);

    screen.getAllByRole('button')[0]?.click();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't start checkout",
    );
  });

  it('should explain a checkout that returns no url', async () => {
    startCheckout.mockResolvedValue(undefined);
    render(VipSubscribe);

    screen.getAllByRole('button')[0]?.click();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('should clear the alert when the next attempt starts', async () => {
    startCheckout.mockRejectedValueOnce(new Error('offline'));
    startCheckout.mockReturnValueOnce(new Promise(() => {}));
    render(VipSubscribe);

    screen.getAllByRole('button')[0]?.click();
    await screen.findByRole('alert');
    screen.getAllByRole('button')[0]?.click();

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('should show no alert while a checkout is in flight', async () => {
    startCheckout.mockReturnValue(new Promise(() => {}));
    render(VipSubscribe);

    screen.getAllByRole('button')[0]?.click();

    await waitFor(() => expect(startCheckout).toHaveBeenCalledOnce());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
