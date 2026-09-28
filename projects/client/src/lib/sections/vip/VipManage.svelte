<script lang="ts">
  import AccountDetails from './_internal/AccountDetails.svelte';
  import PaypalSwitchCard from './_internal/PaypalSwitchCard.svelte';
  import UsageTabs from './_internal/UsageTabs.svelte';
  import { useVip } from './_internal/useVip.ts';
  import VipFeatureList from './_internal/VipFeatureList.svelte';

  const { subscription, isLoading } = useVip();
</script>

{#if !$isLoading}
  <div class="vip-manage">
    <div class="vip-account-group">
      <AccountDetails subscription={$subscription} />
      <PaypalSwitchCard subscription={$subscription} />
    </div>
    <UsageTabs subscription={$subscription} />
    <VipFeatureList />
  </div>
{/if}

<style lang="scss">
  .vip-manage {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxl);
  }

  .vip-account-group {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }
</style>
