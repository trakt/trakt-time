<script lang="ts">
  import CalendarAddIcon from '$lib/components/icons/CalendarAddIcon.svelte';
  import CopyIcon from '$lib/components/icons/CopyIcon.svelte';
  import { useActionToast } from '$lib/features/action-toast/useActionToast.ts';
  import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
  import { useTrack } from '$lib/features/analytics/useTrack.ts';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaType } from '$lib/requests/models/MediaType.ts';
  import { copyToClipboard } from '$lib/utils/clipboard/copyToClipboard.ts';
  import { Popover } from 'bits-ui';
  import { calendarFeedOrigin } from './_internal/calendarFeedOrigin.ts';
  import { toCalendarFeedUrl } from './_internal/toCalendarFeedUrl.ts';

  const { mode }: { mode: MediaType } = $props();

  const { user } = useUser();
  const { track } = useTrack(AnalyticsEvent.CalendarFeed);
  const { notify } = useActionToast();

  const origin = calendarFeedOrigin(TRAKT_TARGET_ENVIRONMENT);

  const feedUrl = $derived(
    $user.token ? toCalendarFeedUrl({ origin, token: $user.token, mode }) : null,
  );

  let open = $state(false);

  const subscribe = () => {
    open = false;
    track({ action: 'subscribe', mode });
  };

  const copyLink = async () => {
    open = false;
    if (!feedUrl) return;

    track({ action: 'copy', mode });

    const isCopied = await copyToClipboard(feedUrl.https)
      .then(() => true, () => false);
    if (!isCopied) return;

    notify({ message: m.text_info_calendar_feed_copied() });
  };
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        class="calendar-feed-trigger"
        data-ready={feedUrl != null}
        disabled={feedUrl == null}
        aria-label={m.button_label_calendar_feed()}
      >
        <CalendarAddIcon />
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      class="calendar-feed-menu"
      sideOffset={8}
      align="end"
      collisionPadding={16}
    >
      {#if feedUrl}
        <a
          class="menu-item"
          href={feedUrl.webcal}
          rel="external"
          aria-label={m.button_label_open_calendar_feed()}
          onclick={subscribe}
        >
          <CalendarAddIcon />
          <span>{m.button_text_open_calendar_feed()}</span>
        </a>

        <button
          type="button"
          class="menu-item"
          aria-label={m.button_label_copy_calendar_feed()}
          onclick={copyLink}
        >
          <CopyIcon />
          <span>{m.button_text_copy_calendar_feed()}</span>
        </button>
      {/if}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style lang="scss">
  .calendar-feed-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-40);
    height: var(--ni-40);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--color-card-background);
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    &[data-ready='false'] {
      opacity: 0;
      pointer-events: none;
    }

    &:hover,
    &:focus-visible,
    &[data-state='open'] {
      color: var(--color-text-primary);
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
    }
  }

  :global(.calendar-feed-menu) {
    z-index: var(--layer-top);
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: var(--ni-200);
    padding: var(--gap-xs);
    background-color: var(--color-floating-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-l);
    box-shadow: var(--shadow-menu);
  }

  :global(.calendar-feed-menu .menu-item) {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-visible {
      background-color: color-mix(
        in srgb,
        var(--color-text-primary) 8%,
        transparent
      );
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: calc(-1 * var(--ni-2));
    }

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      flex-shrink: 0;
    }
  }
</style>
