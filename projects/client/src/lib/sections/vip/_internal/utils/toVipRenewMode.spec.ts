import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
import { describe, expect, it } from 'vitest';
import { toVipRenewMode } from './toVipRenewMode.ts';

const subscription = (override: Partial<VipSubscription>) =>
  ({ gateway: 'stripe', isCancelled: false, ...override }) as VipSubscription;

describe('toVipRenewMode', () => {
  it('should offer the card switch to an active PayPal subscriber', () => {
    expect(
      toVipRenewMode(subscription({ gateway: 'paypal', isCancelled: false })),
    ).toBe('paypal-switch');
  });

  it('should welcome back a cancelled PayPal subscriber', () => {
    expect(
      toVipRenewMode(subscription({ gateway: 'paypal', isCancelled: true })),
    ).toBe('welcome-back');
  });

  it('should welcome back a cancelled Stripe subscriber', () => {
    expect(
      toVipRenewMode(subscription({ gateway: 'stripe', isCancelled: true })),
    ).toBe('welcome-back');
  });

  it('should welcome back someone without a subscription', () => {
    expect(toVipRenewMode(null)).toBe('welcome-back');
  });
});
