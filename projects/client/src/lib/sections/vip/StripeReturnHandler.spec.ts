import { goto } from '$app/navigation';
import { render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StripeReturnHandler from './StripeReturnHandler.svelte';

const confirmCheckout = vi.fn();

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

vi.mock('$app/state', () => ({
  page: { url: new URL('http://localhost/vip?session_id=cs_test') },
}));

vi.mock('./_internal/useVip.ts', () => ({
  useVip: () => ({ confirmCheckout }),
}));

describe('component: StripeReturnHandler', () => {
  const unhandled = vi.fn();

  beforeEach(() => {
    process.on('unhandledRejection', unhandled);
  });

  afterEach(() => {
    process.off('unhandledRejection', unhandled);
    unhandled.mockReset();
    confirmCheckout.mockReset();
  });

  it('should keep the session in the url when the confirmation fails', async () => {
    confirmCheckout.mockRejectedValue(new Error('offline'));

    render(StripeReturnHandler);
    await vi.waitFor(() =>
      expect(confirmCheckout).toHaveBeenCalledWith('cs_test'),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(unhandled).not.toHaveBeenCalled();
    expect(goto).not.toHaveBeenCalled();
  });

  it('should drop the session from the url once confirmed', async () => {
    confirmCheckout.mockResolvedValue(true);

    render(StripeReturnHandler);

    await vi.waitFor(() => expect(goto).toHaveBeenCalled());
    const [url] = vi.mocked(goto).mock.lastCall ?? [];
    expect(String(url)).not.toContain('session_id');
  });
});
