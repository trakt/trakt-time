<script lang="ts">
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
  import { toHumanDay } from '$lib/utils/formatting/date/toHumanDay.ts';
  import CalendarIcon from '$lib/components/icons/CalendarIcon.svelte';
  import CreditCardIcon from './icons/CreditCardIcon.svelte';
  import CrownIcon from './icons/CrownIcon.svelte';
  import SubscriptionActions from './SubscriptionActions.svelte';
  import SubscriptionDetail from './SubscriptionDetail.svelte';
  import { toPaidUntil } from './utils/toPaidUntil.ts';
  import { toPaymentMethodLabel } from './utils/toPaymentMethodLabel.ts';
  import { toVipDurationLabel } from './utils/toVipDurationLabel.ts';

  const { subscription }: { subscription: VipSubscription | Nil } = $props();

  const { user } = useUser();

  const isLifeTime = $derived(subscription?.type === 'life');

  const planText = $derived(
    subscription?.renewalPrice?.readable ??
      toVipDurationLabel(subscription?.type) ??
      undefined,
  );

  const paidUntil = $derived(subscription ? toPaidUntil(subscription) : null);
</script>

<div class="vip-account-details">
  <div class="vip-account-header">
    <div class="vip-account-user">
      <h1 class="vip-account-name">{$user.username}</h1>
      <VipBadge isDirector={$user.isDirector} />
    </div>
    {#if subscription?.memberSince}
      <p class="vip-account-member-since">
        {m.text_member_since({
          date: toHumanDay({
            date: subscription.memberSince,
            locale: getLocale(),
          }),
        })}
      </p>
    {/if}
  </div>

  {#if subscription && !isLifeTime}
    <div class="vip-subscription-details">
      {#if paidUntil}
        <SubscriptionDetail title={m.header_paid_until()}>
          {#snippet icon()}
            <CalendarIcon />
          {/snippet}
          {toHumanDay({ date: paidUntil, locale: getLocale() })}
        </SubscriptionDetail>
      {/if}

      {#if subscription.renewsAt}
        <SubscriptionDetail title={m.header_renewal_date()}>
          {#snippet icon()}
            <CalendarIcon />
          {/snippet}
          {toHumanDay({ date: subscription.renewsAt, locale: getLocale() })}
        </SubscriptionDetail>
      {:else if subscription.expiresAt}
        <SubscriptionDetail title={m.header_expiration_date()}>
          {#snippet icon()}
            <CalendarIcon />
          {/snippet}
          {toHumanDay({ date: subscription.expiresAt, locale: getLocale() })}
        </SubscriptionDetail>
      {/if}

      {#if planText}
        <SubscriptionDetail title={m.header_current_plan()}>
          {#snippet icon()}
            <CrownIcon />
          {/snippet}
          {planText}
        </SubscriptionDetail>
      {/if}

      <SubscriptionDetail title={m.header_payment_method()}>
        {#snippet icon()}
          <CreditCardIcon />
        {/snippet}
        {toPaymentMethodLabel(subscription.gateway)}
      </SubscriptionDetail>
    </div>

    {#if !$user.isDirector}
      <SubscriptionActions {subscription} />
    {/if}
  {/if}
</div>

<style lang="scss">
  .vip-account-details {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);

    padding: var(--gap-m);
    border-radius: var(--border-radius-l);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .vip-account-header {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .vip-account-user {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .vip-account-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .vip-account-member-since {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .vip-subscription-details {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }
</style>
