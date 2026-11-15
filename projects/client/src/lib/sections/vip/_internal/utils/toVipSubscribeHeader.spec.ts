import { describe, expect, it } from 'vitest';
import type { VipDealPlan } from '../models/VipDealPlan.ts';
import { toVipSubscribeHeader } from './toVipSubscribeHeader.ts';

const dealPlan: VipDealPlan = {
  type: 'two_years',
  monthlyPrice: 2.92,
  totalPrice: 69.99,
  durationInMonths: 24,
  isPopular: false,
  discount: {
    discountedAmount: 49.99,
    discountedAmountMonthly: 2.08,
    firstTermOnly: true,
  },
};

describe('toVipSubscribeHeader', () => {
  it('should keep the upgrade copy for new subscribers', () => {
    const header = toVipSubscribeHeader({ mode: 'subscribe', dealPlan });

    expect(header.title).to.equal('Unlock more with Trakt');
  });

  it('should keep the renewal copy for returning members despite a deal', () => {
    const header = toVipSubscribeHeader({ mode: 'welcome-back', dealPlan });

    expect(header.title).to.equal('Renew Subscription');
    expect(header.tagline).not.to.contain('auto-renews');
  });

  it('should fall back to renewal copy when there is no deal', () => {
    const header = toVipSubscribeHeader({
      mode: 'welcome-back',
      dealPlan: null,
    });

    expect(header.title).to.equal('Renew Subscription');
  });

  it('should explain the card switch to PayPal members', () => {
    const header = toVipSubscribeHeader({
      mode: 'paypal-switch',
      dealPlan: null,
    });

    expect(header.title).to.equal('Switch to credit card');
  });
});
