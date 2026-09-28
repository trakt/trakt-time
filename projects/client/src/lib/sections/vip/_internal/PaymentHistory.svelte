<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import MessageWithBold from '$lib/components/text/MessageWithBold.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import type { VipTransaction } from '$lib/requests/models/VipTransaction.ts';
  import { toHumanDay } from '$lib/utils/formatting/date/toHumanDay.ts';
  import CreditCardIcon from './icons/CreditCardIcon.svelte';
  import CrownIcon from './icons/CrownIcon.svelte';
  import { toTransactionDescription } from './utils/toTransactionDescription.ts';

  const { transactions }: { transactions: ReadonlyArray<VipTransaction> } =
    $props();

  function iconFor(type: VipTransaction['type']) {
    switch (type) {
      case 'payment':
      case 'refund':
        return CreditCardIcon;
      case 'create':
      case 'plan_change':
        return CrownIcon;
      case 'cancel':
      case 'dispute':
        return CloseIcon;
      default:
        return SparkleIcon;
    }
  }
</script>

<div class="vip-payment-history">
  {#each transactions as transaction (transaction.id)}
    {@const Icon = iconFor(transaction.type)}
    <div class="vip-payment-history-row">
      <div class="vip-payment-history-icon">
        <Icon />
      </div>

      <div class="vip-payment-history-detail">
        <span class="vip-payment-history-time">
          {toHumanDay({
            date: transaction.createdAt,
            locale: getLocale(),
            format: 'short-with-time',
          })}
        </span>
        <span>
          <MessageWithBold message={toTransactionDescription(transaction)} />
        </span>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .vip-payment-history {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);

    padding: var(--gap-m);
    border-radius: var(--border-radius-l);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .vip-payment-history-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .vip-payment-history-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    width: var(--ni-36);
    height: var(--ni-36);

    border-radius: var(--border-radius-m);
    background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--color-text-primary) 10%, transparent);

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
      color: var(--color-text-secondary);
    }
  }

  .vip-payment-history-detail {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;

    font-size: 0.875rem;
    line-height: 1.3;
  }

  .vip-payment-history-time {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
</style>
