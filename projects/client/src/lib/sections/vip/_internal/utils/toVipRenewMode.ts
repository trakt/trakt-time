import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
import type { VipSubscribeMode } from '../models/VipSubscribeMode.ts';
import { isPaypalGateway } from './isPaypalGateway.ts';

export function toVipRenewMode(
  subscription: VipSubscription | Nil,
): VipSubscribeMode {
  const isPaypalSwitch =
    isPaypalGateway(subscription?.gateway) && !subscription?.isCancelled;

  return isPaypalSwitch ? 'paypal-switch' : 'welcome-back';
}
