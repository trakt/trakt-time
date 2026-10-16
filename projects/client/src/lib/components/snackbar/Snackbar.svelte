<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { onMount } from 'svelte';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  type SnackbarAction = {
    text: string;
    label: string;
    onAction: () => void;
  };

  type SnackbarProps = {
    message: string;
    onDismiss: () => void;
    action?: SnackbarAction;
    variant?: 'default' | 'error';
    durationMs?: number;
  };

  const {
    message,
    onDismiss,
    action,
    variant = 'default',
    durationMs,
  }: SnackbarProps = $props();

  const isMotionReduced = () =>
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false;

  const enterTransition = {
    y: isMotionReduced() ? 0 : 32,
    duration: isMotionReduced() ? 120 : 280,
    easing: cubicOut,
  };

  const exitTransition = {
    y: isMotionReduced() ? 0 : 32,
    duration: isMotionReduced() ? 120 : 200,
    easing: cubicIn,
  };

  onMount(() => {
    if (durationMs == null) return;

    const timer = setTimeout(onDismiss, durationMs);

    return () => clearTimeout(timer);
  });
</script>

<div
  class="trakt-snackbar"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-variant={variant}
  in:fly|global={enterTransition}
  out:fly|global={exitTransition}
>
  <p class="snackbar-message">{message}</p>

  {#if action}
    <button
      type="button"
      class="snackbar-action"
      aria-label={action.label}
      onclick={action.onAction}
    >
      {action.text}
    </button>
  {/if}

  <button
    type="button"
    class="snackbar-close"
    aria-label={m.button_label_close()}
    onclick={onDismiss}
  >
    <CloseIcon />
  </button>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .trakt-snackbar {
    position: fixed;
    z-index: var(--layer-top);
    left: 50%;
    bottom: calc(
      var(--gap-s) + env(safe-area-inset-bottom, var(--ni-0)) +
        var(--trakttime-bottom-nav-height) + var(--gap-s)
    );
    transform: translateX(-50%);

    display: flex;
    align-items: center;
    gap: var(--gap-s);
    box-sizing: border-box;
    width: calc(100% - 2 * var(--gap-m));
    max-width: calc(var(--trakttime-max-width) - 2 * var(--gap-m));
    min-height: var(--ni-56);
    padding: var(--gap-xs) var(--gap-xs) var(--gap-xs) var(--gap-m);

    background-color: var(--trakttime-navbar-solid-bg);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    box-shadow: var(--shadow-raised);
    color: var(--color-text-primary);

    &[data-variant='error'] {
      border-color: var(--red-500);
    }

    @include for-tablet-sm-and-up {
      width: var(--trakttime-bottom-nav-compact-width);
    }

    @include for-desktop {
      left: var(--trakttime-column-center);
      bottom: calc(var(--gap-l) + env(safe-area-inset-bottom, var(--ni-0)));
    }
  }

  .snackbar-message {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .snackbar-action,
  .snackbar-close {
    flex-shrink: 0;
    border: none;
    cursor: pointer;
    font: inherit;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .snackbar-action {
    padding: var(--gap-xs) var(--gap-s);
    border: var(--ni-1) solid var(--trakttime-accent);
    border-radius: var(--trakttime-radius-pill);
    background: none;
    color: var(--trakttime-accent);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .snackbar-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--color-text-primary) 12%, transparent);
      color: var(--color-text-primary);
    }
  }
</style>
