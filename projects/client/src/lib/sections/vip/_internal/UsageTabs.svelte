<script lang="ts">
  import TabView from '$lib/components/tabs/TabView.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { VipSubscription } from '$lib/requests/models/VipSubscription.ts';
  import PaymentHistory from './PaymentHistory.svelte';
  import UsageLimits from './UsageLimits.svelte';

  const { subscription }: { subscription: VipSubscription | Nil } = $props();

  let activeTab = $state('usage');

  const transactions = $derived(subscription?.transactions ?? []);
</script>

{#snippet usageLimits()}
  <UsageLimits />
{/snippet}

{#snippet history()}
  <PaymentHistory {transactions} />
{/snippet}

{#if transactions.length > 0}
  <TabView
    value={activeTab}
    onChange={(value) => (activeTab = value)}
    tabs={[
      { value: 'usage', label: m.button_text_usage(), content: usageLimits },
      { value: 'history', label: m.button_text_history(), content: history },
    ]}
  />
{:else}
  {@render usageLimits()}
{/if}
