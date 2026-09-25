<script lang="ts">
  import Drawer from '$lib/components/drawer/Drawer.svelte';
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { fade } from 'svelte/transition';
  import TriviaCard from './TriviaCard.svelte';
  import type { TriviaFact } from './toTriviaFacts.ts';

  const {
    facts,
    onClose,
  }: {
    facts: ReadonlyArray<TriviaFact>;
    onClose: () => void;
  } = $props();

  let isOpen = $state(false);
</script>

<Drawer
  {onClose}
  onOpened={() => (isOpen = true)}
  title={m.list_title_trivia()}
  variant="vip"
  size="auto"
>
  {#if isOpen}
    <div class="trivia-drawer-list" transition:fade={{ duration: 150 }}>
      <RenderFor audience="free">
        <UpsellCta source="trivia">{m.text_vip_upsell_trivia()}</UpsellCta>
      </RenderFor>
      {#each facts as trivia (trivia.key)}
        <TriviaCard {trivia} />
      {/each}
    </div>
  {/if}
</Drawer>

<style lang="scss">
  .trivia-drawer-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }
</style>
