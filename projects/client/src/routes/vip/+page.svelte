<script lang="ts">
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import StripeReturnHandler from '$lib/sections/vip/StripeReturnHandler.svelte';
  import VipManage from '$lib/sections/vip/VipManage.svelte';
  import VipSubscribe from '$lib/sections/vip/VipSubscribe.svelte';
  import * as m from '$lib/paraglide/messages.js';

  const { isAuthorized, login } = useAuth();
</script>

<svelte:head>
  <title>VIP - Trakt Time</title>
</svelte:head>

<div class="vip-page">
  <BackBar label={m.button_label_back()} />

  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else}
    <StripeReturnHandler />

    <RenderFor audience="free">
      <VipSubscribe />
    </RenderFor>

    <RenderFor audience="vip">
      <VipManage />
    </RenderFor>
  {/if}
</div>

<style lang="scss">
  .vip-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxl);

    max-width: var(--trakttime-max-width);
    margin: 0 auto;
    box-sizing: border-box;
    width: 100%;

    /* clear the fixed back bar */
    padding: calc(var(--gap-l) + var(--ni-48)) var(--gap-m)
      var(--trakttime-bottom-nav-height);
  }
</style>
