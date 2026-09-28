import type { VipDealPlan } from '../models/VipDealPlan.ts';
import { toVipPriceLabel } from './toVipPriceLabel.ts';

export function toDealPrices(plan: VipDealPlan) {
  return {
    price: toVipPriceLabel(plan.discount.discountedAmount),
    renewalPrice: toVipPriceLabel(plan.totalPrice),
  };
}
