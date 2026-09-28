import { rawApiFetch } from '$lib/requests/api.ts';
import { describe, expect, it, vi } from 'vitest';
import { cancelSubscriptionQuery } from './cancelSubscriptionQuery.ts';

vi.mock('$lib/requests/api.ts', () => ({ rawApiFetch: vi.fn() }));

describe('cancelSubscriptionQuery', () => {
  it('should report a cancelled subscription', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const result = await cancelSubscriptionQuery();

    expect(result).to.equal(true);
  });

  it('should return false when there is no active subscription', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      Response.json({ message: 'No active Stripe subscriptions found' }, {
        status: 404,
      }),
    );

    const result = await cancelSubscriptionQuery();

    expect(result).to.equal(false);
  });
});
