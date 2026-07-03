<script lang="ts">
  import AccountDetails from './_internal/AccountDetails.svelte';
  import UsageLimits from './_internal/UsageLimits.svelte';
  import { useVip } from './_internal/useVip.ts';
  import VipFeatureList from './_internal/VipFeatureList.svelte';

  const { subscription, isLoading } = useVip();
</script>

{#if !$isLoading}
  <div class="vip-manage">
    <AccountDetails subscription={$subscription} />
    <UsageLimits />
    <VipFeatureList />
  </div>
{/if}

<style lang="scss">
  .vip-manage {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxl);
  }
</style>
