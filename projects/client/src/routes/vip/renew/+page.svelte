<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import LoginGate from '$lib/components/auth/LoginGate.svelte';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import { useVip } from '$lib/sections/vip/_internal/useVip.ts';
  import { isPaypalGateway } from '$lib/sections/vip/_internal/utils/isPaypalGateway.ts';
  import VipSubscribe from '$lib/sections/vip/VipSubscribe.svelte';
  import * as m from '$lib/paraglide/messages.js';

  const { isAuthorized, login } = useAuth();
  const { subscription, isLoading } = useVip();

  const canResubscribe = $derived(
    $subscription?.isCancelled || isPaypalGateway($subscription?.gateway),
  );

  $effect(() => {
    if (!$isAuthorized || $isLoading || canResubscribe) return;
    goto(resolve('/vip'), { replaceState: true });
  });
</script>

<SeoHead title="VIP" noindex />

<div class="vip-renew-page">
  <BackBar label={m.tag_text_vip()} />

  {#if !$isAuthorized}
    <LoginGate {login} />
  {:else if !$isLoading && canResubscribe}
    <VipSubscribe />
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .vip-renew-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxl);

    max-width: var(--trakttime-max-width);
    margin: 0 auto;
    box-sizing: border-box;
    width: 100%;

    padding: calc(var(--gap-l) + var(--ni-48)) var(--gap-m)
      var(--trakttime-bottom-nav-height);

    @include for-desktop {
      max-width: var(--ni-920);
    }
  }
</style>
