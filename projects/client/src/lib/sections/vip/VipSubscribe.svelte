<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { VIP_PLANS } from './_internal/constants/index.ts';
  import PlanCard from './_internal/PlanCard.svelte';
  import { useVip } from './_internal/useVip.ts';
  import VipFailureAlert from './_internal/VipFailureAlert.svelte';
  import VipFeatureList from './_internal/VipFeatureList.svelte';
  import VipHeader from './_internal/VipHeader.svelte';
  import type { VipPlan } from './_internal/models/VipPlan.ts';
  import type { VipSubscribeMode } from './_internal/models/VipSubscribeMode.ts';
  import { findTwoYearDealPlan } from './_internal/utils/findTwoYearDealPlan.ts';
  import { toVipSubscribeHeader } from './_internal/utils/toVipSubscribeHeader.ts';

  const { mode = 'subscribe' }: { mode?: VipSubscribeMode } = $props();

  const { plans, startCheckout, isFetching } = useVip();

  const activePlans = $derived($plans.length > 0 ? $plans : VIP_PLANS);

  const header = $derived(
    toVipSubscribeHeader({ mode, dealPlan: findTwoYearDealPlan(activePlans) }),
  );

  let hasFailed = $state(false);

  const onSelect = async (plan: VipPlan) => {
    if ($isFetching) {
      return;
    }

    hasFailed = false;

    const url = await startCheckout(plan).catch(() => null);
    if (!url) {
      hasFailed = true;
      return;
    }

    globalThis.window.location.href = url;
  };
</script>

<div class="vip-subscribe">
  <VipHeader title={header.title} tagline={header.tagline} />

  <div class="vip-plans">
    {#each activePlans as plan (plan.type)}
      <PlanCard
        {plan}
        disabled={$isFetching}
        isRenewal={mode !== 'subscribe'}
        {onSelect}
      />
    {/each}
  </div>

  {#if hasFailed}
    <VipFailureAlert
      title={m.text_vip_checkout_failed_title()}
      message={m.text_vip_subscription_failed_message()}
    />
  {/if}

  <VipFeatureList />
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .vip-subscribe {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxl);
  }

  .vip-plans {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap-m);

    @include for-tablet-sm {
      grid-template-columns: repeat(3, 1fr);
    }

    @include for-desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
