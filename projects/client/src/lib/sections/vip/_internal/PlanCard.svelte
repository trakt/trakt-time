<script lang="ts">
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { toHumanCurrency } from '$lib/utils/formatting/currency/toHumanCurrency.ts';
  import type { VipPlan } from './models/VipPlan.ts';

  const {
    plan,
    disabled,
    onSelect,
  }: {
    plan: VipPlan;
    disabled: boolean;
    onSelect: (plan: VipPlan) => void;
  } = $props();

  const hasDiscount = $derived(plan.discount != null);

  const formatCurrency = (price: number) =>
    toHumanCurrency({ price, currency: 'usd', locale: languageTag() });

  const displayPrice = $derived(
    formatCurrency(
      plan.discount ? plan.discount.discountedAmountMonthly : plan.monthlyPrice,
    ),
  );

  const billedText = $derived.by(() => {
    switch (plan.type) {
      case 'monthly':
        return m.text_vip_billed_monthly();
      case 'yearly':
        return m.text_vip_billed_yearly();
      case 'two_years':
        return m.text_vip_billed_biyearly();
    }
  });
</script>

<button
  type="button"
  class="vip-plan-card"
  class:is-popular={plan.isPopular}
  {disabled}
  onclick={() => onSelect(plan)}
  aria-label={m.button_label_vip_upgrade()}
>
  {#if plan.isPopular}
    <span class="vip-plan-popular-tag">{m.tag_text_most_popular()}</span>
  {/if}

  <div class="vip-plan-pricing">
    <span class="vip-plan-price">
      {displayPrice}<span class="vip-plan-per-month">/mo</span>
    </span>
    {#if hasDiscount}
      <span class="vip-plan-original-price">
        {formatCurrency(plan.monthlyPrice)}/mo
      </span>
    {/if}
    <span class="vip-plan-billed">{billedText}</span>
  </div>

  <span class="vip-plan-upgrade-label">{m.button_text_vip_upgrade()}</span>
</button>

<style lang="scss">
  .vip-plan-card {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-m);

    padding: var(--gap-l) var(--gap-m);
    box-sizing: border-box;

    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-l);

    color: var(--color-text-primary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &.is-popular {
      border-color: var(--color-vip-border-accent);
      background: var(--background-subscription-card);
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  .vip-plan-popular-tag {
    position: absolute;
    top: 0;
    transform: translateY(-50%);

    padding: var(--gap-xxs) var(--gap-s);
    border-radius: var(--border-radius-xxl);

    background: var(--color-vip-popular-tag);
    color: var(--shade-900);

    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .vip-plan-pricing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xxs);
  }

  .vip-plan-price {
    font-size: 2rem;
    font-weight: 700;
  }

  .vip-plan-per-month {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-secondary);
  }

  .vip-plan-original-price {
    font-size: 0.8125rem;
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  .vip-plan-billed {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .vip-plan-upgrade-label {
    padding: var(--gap-xs) var(--gap-m);
    border-radius: var(--border-radius-m);

    background: var(--color-background-vip-badge);
    color: var(--color-foreground-vip-badge);

    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
