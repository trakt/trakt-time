import { rawApiFetch } from '$lib/requests/api.ts';
import { FETCH_ERROR_EVENT } from '$lib/features/errors/constants.ts';
import { describe, expect, it, vi } from 'vitest';
import { manageSubscriptionQuery } from './manageSubscriptionQuery.ts';

vi.mock('$lib/requests/api.ts', () => ({ rawApiFetch: vi.fn() }));

const CHECKOUT_URL = 'https://billing.stripe.com/p/session/test';
const RETURN_URL = 'https://app.trakt.tv/vip';

describe('manageSubscriptionQuery', () => {
  it('should return the checkout url', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      Response.json({ checkout_url: CHECKOUT_URL }),
    );

    const result = await manageSubscriptionQuery({ returnUrl: RETURN_URL });

    expect(result).to.deep.equal({ kind: 'redirect', url: CHECKOUT_URL });
  });

  it('should report a missing subscription', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      Response.json({ message: 'No active Stripe subscriptions found' }, {
        status: 404,
      }),
    );

    const result = await manageSubscriptionQuery({ returnUrl: RETURN_URL });

    expect(result).to.deep.equal({ kind: 'missing-subscription' });
  });

  it('should report an unavailable subscription page on no content', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const result = await manageSubscriptionQuery({ returnUrl: RETURN_URL });

    expect(result).to.deep.equal({ kind: 'unavailable' });
  });

  it('should throw when the subscription cannot be updated', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      Response.json({ message: 'User is not a Stripe VIP' }, { status: 400 }),
    );

    await expect(manageSubscriptionQuery({ returnUrl: RETURN_URL })).rejects
      .toThrow('Failed to fetch data');
  });

  it('should not replace the page on a server error', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const onFetchError = vi.fn();
    globalThis.window.addEventListener(FETCH_ERROR_EVENT, onFetchError);

    await expect(manageSubscriptionQuery({ returnUrl: RETURN_URL })).rejects
      .toThrow('(500)');

    globalThis.window.removeEventListener(FETCH_ERROR_EVENT, onFetchError);
    expect(onFetchError).not.toHaveBeenCalled();
  });
});
