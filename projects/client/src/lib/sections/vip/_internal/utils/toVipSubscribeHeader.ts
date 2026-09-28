import { m } from '$lib/features/i18n/messages.ts';
import type { VipDealPlan } from '../models/VipDealPlan.ts';
import type { VipSubscribeMode } from '../models/VipSubscribeMode.ts';
import { toDealPrices } from './toDealPrices.ts';

type VipSubscribeHeader = {
  title: string;
  tagline: string;
};

type ToVipSubscribeHeaderParams = {
  mode: VipSubscribeMode;
  dealPlan: VipDealPlan | Nil;
};

function toWelcomeBackHeader(dealPlan: VipDealPlan | Nil): VipSubscribeHeader {
  if (!dealPlan) {
    return {
      title: m.button_label_renew_vip(),
      tagline: m.text_vip_get_insights(),
    };
  }

  const prices = toDealPrices(dealPlan);
  return {
    title: m.header_vip_deal_welcome_back({ price: prices.price }),
    tagline: m.text_vip_deal_welcome_back(prices),
  };
}

function toPaypalSwitchHeader(
  dealPlan: VipDealPlan | Nil,
): VipSubscribeHeader {
  if (!dealPlan) {
    return {
      title: m.header_vip_paypal_switch(),
      tagline: m.text_vip_paypal_switch(),
    };
  }

  const prices = toDealPrices(dealPlan);
  return {
    title: m.header_vip_deal_paypal_switch({ price: prices.price }),
    tagline: m.text_vip_deal_paypal_switch(prices),
  };
}

export function toVipSubscribeHeader(
  { mode, dealPlan }: ToVipSubscribeHeaderParams,
): VipSubscribeHeader {
  switch (mode) {
    case 'welcome-back':
      return toWelcomeBackHeader(dealPlan);
    case 'paypal-switch':
      return toPaypalSwitchHeader(dealPlan);
    case 'subscribe':
      return {
        title: 'Unlock more with Trakt',
        tagline: m.text_vip_get_insights(),
      };
  }
}
