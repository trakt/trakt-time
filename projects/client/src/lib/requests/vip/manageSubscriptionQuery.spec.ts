import { rawApiFetch } from '$lib/requests/api.ts';
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
});
