import { describe, expect, it } from 'vitest';
import type { VipDealPlan } from '../models/VipDealPlan.ts';
import { toDealBilledLabel } from './toDealBilledLabel.ts';

describe('toDealBilledLabel', () => {
  it('should name the first-term price and what it renews at', () => {
    const plan: VipDealPlan = {
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

    expect(toDealBilledLabel(plan)).to.equal(
      '$49.99 for your first 2 years, then $69.99 every 2 years',
    );
  });
});
