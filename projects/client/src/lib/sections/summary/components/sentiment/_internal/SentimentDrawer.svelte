<script lang="ts">
  import Drawer from '$lib/components/drawer/Drawer.svelte';
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { SentimentAnalysis } from '$lib/requests/models/SentimentAnalysis.ts';
  import { fade } from 'svelte/transition';
  import SentimentContent from './SentimentContent.svelte';

  const {
    sentiment,
    onClose,
  }: {
    sentiment: SentimentAnalysis;
    onClose: () => void;
  } = $props();

  let isOpen = $state(false);
</script>

<Drawer
  {onClose}
  onOpened={() => (isOpen = true)}
  title={m.header_community_sentiment()}
  variant="vip"
  size="auto"
>
  {#if isOpen}
    <div class="sentiment-drawer-body" transition:fade={{ duration: 150 }}>
      <RenderFor audience="free">
        <UpsellCta source="sentiment">{m.text_vip_upsell_sentiment()}</UpsellCta>
      </RenderFor>
      <SentimentContent {sentiment} />
    </div>
  {/if}
</Drawer>

<style lang="scss">
  .sentiment-drawer-body {
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);
  }
</style>
