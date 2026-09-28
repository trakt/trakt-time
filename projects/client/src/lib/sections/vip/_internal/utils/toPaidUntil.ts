import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
import { startOfDay } from 'date-fns/startOfDay';

export function toPaidUntil(
  subscription: Pick<VipSubscription, 'renewsAt' | 'expiresAt'>,
): Date | null {
  const { renewsAt, expiresAt } = subscription;
  if (!renewsAt || !expiresAt) return null;

  return startOfDay(expiresAt) > startOfDay(renewsAt) ? expiresAt : null;
}
