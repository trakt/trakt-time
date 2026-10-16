<script lang="ts">
  import ReactionsPopup from '$lib/components/reactions/ReactionsPopup.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useMedia, WellKnownMediaQuery } from '$lib/stores/css/useMedia.ts';
  import ReactionsPopoverContent from './ReactionsPopoverContent.svelte';
  import type { ReactionsPopoverProps } from './ReactionsPopoverProps.ts';
  import ReactionsSheet from './ReactionsSheet.svelte';

  const { trigger: badge, onOpenChange, ...content }: ReactionsPopoverProps =
    $props();

  const isMobile = useMedia(WellKnownMediaQuery.mobile);
  const isTabletSmall = useMedia(WellKnownMediaQuery.tabletSmall);
  const hasSheet = $derived($isMobile || $isTabletSmall);

  let isSheetOpen = $state(false);
  let isPopupOpen = $state(false);

  function changeHandler(isOpened: boolean) {
    isPopupOpen = isOpened;
    onOpenChange?.(isOpened || isSheetOpen);
  }

  function openSheet(close: () => void) {
    close();
    isSheetOpen = true;
    onOpenChange?.(true);
  }

  function closeSheet() {
    isSheetOpen = false;
    onOpenChange?.(isPopupOpen);
  }
</script>

<ReactionsPopup
  reserve={hasSheet ? 252 : 292}
  onOpenChange={changeHandler}
>
  {#snippet trigger(toggle, isOpened)}
    <button
      type="button"
      class="reactions-popover-trigger"
      aria-label={m.button_label_popup_reactions()}
      aria-expanded={isOpened}
      onclick={toggle}
    >
      {@render badge()}
    </button>
  {/snippet}

  {#snippet children(close)}
    <ReactionsPopoverContent
      {...content}
      onMore={hasSheet ? () => openSheet(close) : undefined}
    />
  {/snippet}
</ReactionsPopup>

{#if isSheetOpen}
  <ReactionsSheet
    chosen={content.chosen}
    onSelect={content.onSelect}
    onClose={closeSheet}
  />
{/if}

<style lang="scss">
  .reactions-popover-trigger {
    all: unset;
    display: inline-flex;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
      border-radius: var(--trakttime-radius-pill);
    }
  }
</style>
