import { m } from '$lib/features/i18n/messages.ts';
import type { VipDealPlan } from '../models/VipDealPlan.ts';
import { toDealPrices } from './toDealPrices.ts';

export function toDealBilledLabel(plan: VipDealPlan): string {
  return m.text_vip_billed_deal_first_term(toDealPrices(plan));
}
