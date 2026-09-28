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

  it('should lead with the deal price for returning members', () => {
    const header = toVipSubscribeHeader({ mode: 'welcome-back', dealPlan });

    expect(header.title).to.equal('Get 2 years of VIP for $49.99');
    expect(header.tagline).to.contain('then auto-renews at $69.99');
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
