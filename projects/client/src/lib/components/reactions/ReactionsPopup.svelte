<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { toBody } from '$lib/utils/actions/toBody.ts';
  import { type PopupPosition, toPopupPosition } from './toPopupPosition.ts';
  import type { ReactionsPopupProps } from './ReactionsPopupProps.ts';

  const { trigger, children, reserve, onOpenChange }: ReactionsPopupProps =
    $props();

  const PANEL_WIDTH = 340;
  const VIEWPORT_MARGIN = 16;
  const TRIGGER_GAP = 8;

  let anchor: HTMLElement | null = $state(null);
  let panel: HTMLElement | null = $state(null);
  let position = $state<PopupPosition | null>(null);

  const isOpened = $derived(position != null);

  function reposition() {
    if (!anchor) return;

    const { top, bottom, left } = anchor.getBoundingClientRect();
    position = toPopupPosition({
      trigger: { top, bottom, left },
      viewport: { width: innerWidth, height: innerHeight },
      panelWidth: PANEL_WIDTH,
      reserve,
      margin: VIEWPORT_MARGIN,
      gap: TRIGGER_GAP,
    });
  }

  $effect(() => {
    if (!isOpened) return;

    addEventListener('resize', reposition);

    return () => removeEventListener('resize', reposition);
  });

  function close() {
    if (!isOpened) return;

    position = null;
    onOpenChange?.(false);
  }

  function toggle() {
    if (isOpened) return close();

    reposition();
    onOpenChange?.(true);
  }

  function outsidePressHandler(event: PointerEvent) {
    if (!isOpened) return;

    const target = event.target as Node;
    if (anchor?.contains(target) || panel?.contains(target)) return;

    close();
  }

  function keyHandler(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
  }
</script>

<svelte:document
  onpointerdown={outsidePressHandler}
  onkeydown={keyHandler}
  onscrollcapture={() => isOpened && reposition()}
/>

<span class="reactions-popup-anchor" bind:this={anchor}>
  {@render trigger(toggle, isOpened)}
</span>

{#if position}
  <div
    class="reactions-popup"
    role="dialog"
    aria-label={m.button_label_popup_reactions()}
    data-placement={position.placement}
    bind:this={panel}
    use:toBody
    style:left="{position.left}px"
    style:width="{position.width}px"
    style:top={position.placement === 'bottom' ? `${position.edge}px` : null}
    style:bottom={position.placement === 'top' ? `${position.edge}px` : null}
  >
    {@render children(close)}
  </div>
{/if}

<style lang="scss">
  .reactions-popup-anchor {
    display: inline-flex;
  }

  .reactions-popup {
    position: fixed;
    z-index: var(--layer-top);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: var(--color-reaction-background);
    border-radius: var(--border-radius-xxl);
    box-shadow: var(--shadow-menu);
    animation: reactions-popup-in calc(var(--transition-increment) * 1.5)
      ease-out;

    --reaction-picker-direction: column;

    &[data-placement='top'] {
      transform-origin: bottom center;
    }

    &[data-placement='bottom'] {
      flex-direction: column-reverse;
      transform-origin: top center;
      --reaction-picker-direction: column-reverse;
    }
  }

  @keyframes reactions-popup-in {
    from {
      opacity: 0;
      transform: scale(0.92);
    }
  }
</style>
