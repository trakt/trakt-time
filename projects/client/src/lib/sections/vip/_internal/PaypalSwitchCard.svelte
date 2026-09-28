<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { useVip } from './useVip.ts';
  import { findTwoYearDealPlan } from './utils/findTwoYearDealPlan.ts';
  import { isPaypalGateway } from './utils/isPaypalGateway.ts';
  import { toVipPriceLabel } from './utils/toVipPriceLabel.ts';

  const { subscription }: { subscription: VipSubscription | Nil } = $props();

  const { plans } = useVip();

  const isPaypal = $derived(isPaypalGateway(subscription?.gateway));
  const dealPlan = $derived(findTwoYearDealPlan($plans));
</script>

{#if isPaypal}
  <div class="vip-paypal-switch">
    <div class="vip-paypal-switch-copy">
      <h2>{m.header_vip_paypal_switch()}</h2>
      <p>{m.text_vip_paypal_switch()}</p>
    </div>

    <div class="vip-paypal-switch-action">
      {#if dealPlan}
        <span class="vip-paypal-switch-price">
          {toVipPriceLabel(dealPlan.discount.discountedAmountMonthly)}<span
            class="vip-paypal-switch-per-month">/mo</span
          >
        </span>
        <span class="vip-paypal-switch-billed">
          {m.text_vip_billed_biyearly()}
        </span>
      {/if}
      <Button
        size="small"
        style="flat"
        variant="primary"
        color="purple"
        label={m.button_label_vip_paypal_switch()}
        href={UrlBuilder.renewVip()}
      >
        {m.button_text_vip_paypal_switch()}
      </Button>
    </div>
  </div>
{/if}

<style lang="scss">
  .vip-paypal-switch {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-m);

    padding: var(--gap-m);
    border-radius: var(--border-radius-l);
    background: var(--background-subscription-card);
    border: var(--ni-1) solid var(--color-vip-border-accent);
  }

  .vip-paypal-switch-copy {
    flex: 1 1 var(--ni-280);

    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);

    h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    p {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }
  }

  .vip-paypal-switch-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xxs);

    margin: 0 auto;
  }

  .vip-paypal-switch-price {
    font-size: 1.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .vip-paypal-switch-per-month {
    margin-inline-start: var(--ni-2);
    font-size: 0.5em;
  }

  .vip-paypal-switch-billed {
    margin-bottom: var(--gap-xs);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
</style>
