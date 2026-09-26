<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { useWatchlist } from '$lib/sections/media-actions/watchlist/useWatchlist.ts';
  import type { TrendingEntry } from '$lib/sections/lists/trending/useTrendingList.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { items }: { items: ReadonlyArray<TrendingEntry> } = $props();

  const ROTATE_MS = 8000;

  let activeIndex = $state(0);
  let isPaused = $state(false);

  const active = $derived(items[activeIndex % Math.max(items.length, 1)]);

  const { isWatchlisted, addToWatchlist, removeFromWatchlist, isWatchlistUpdating } =
    $derived(useWatchlist({ type: 'show', media: { id: active?.id ?? 0 } }));

  const prefersReducedMotion = () =>
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true;

  $effect(() => {
    if (items.length < 2 || isPaused || prefersReducedMotion()) return;

    const timer = setInterval(() => {
      activeIndex = (activeIndex + 1) % items.length;
    }, ROTATE_MS);

    return () => clearInterval(timer);
  });

  function toggleWatchlist() {
    ($isWatchlisted ? removeFromWatchlist : addToWatchlist)();
  }
</script>

{#if active}
  <section
    class="discover-spotlight"
    aria-roledescription="carousel"
    aria-label={m.header_trending_shows()}
    onmouseenter={() => (isPaused = true)}
    onmouseleave={() => (isPaused = false)}
    onfocusin={() => (isPaused = true)}
    onfocusout={() => (isPaused = false)}
  >
    {#each items as item, index (item.id)}
      <img
        class="discover-spotlight-cover"
        class:is-active={index === activeIndex}
        src={item.cover.url.medium}
        alt=""
        loading="lazy"
      />
    {/each}

    <div class="discover-spotlight-content">
      <span class="discover-spotlight-eyebrow">{m.header_trending_shows()}</span>
      <a class="discover-spotlight-title" href={UrlBuilder.show(active.slug)}>
        {active.title}
      </a>
      {#if active.year}
        <span class="discover-spotlight-meta">{active.year}</span>
      {/if}
      <p class="discover-spotlight-overview">{active.overview}</p>
      <button
        class="discover-spotlight-action"
        class:is-watchlisted={$isWatchlisted}
        type="button"
        disabled={$isWatchlistUpdating}
        onclick={toggleWatchlist}
        aria-label={$isWatchlisted
          ? m.button_label_remove_from_watchlist({ title: active.title })
          : m.button_label_add_to_watchlist({ title: active.title })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          {#if $isWatchlisted}
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          {:else}
            <path d="M12 5v14M5 12h14" />
          {/if}
        </svg>
        {m.button_text_watchlist()}
      </button>
    </div>

    {#if items.length > 1}
      <div class="discover-spotlight-dots">
        {#each items as item, index (item.id)}
          <button
            type="button"
            class="discover-spotlight-dot"
            class:is-active={index === activeIndex}
            aria-label={item.title}
            aria-current={index === activeIndex}
            onclick={() => (activeIndex = index)}
          ></button>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .discover-spotlight {
    display: none;

    @include for-tablet-sm-and-up {
      position: relative;
      display: flex;
      align-items: flex-end;
      height: var(--ni-280);
      margin: var(--gap-s) var(--trakttime-page-gutter) var(--gap-m);
      border-radius: var(--border-radius-xxl);
      overflow: hidden;
      background: var(--color-card-background);
      isolation: isolate;
    }

    @include for-desktop {
      height: var(--ni-340);
      margin-top: var(--gap-l);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background:
        linear-gradient(
          90deg,
          color-mix(in srgb, var(--shade-1000) 92%, transparent) 0%,
          color-mix(in srgb, var(--shade-1000) 55%, transparent) 45%,
          transparent 75%
        ),
        linear-gradient(
          0deg,
          color-mix(in srgb, var(--shade-1000) 60%, transparent),
          transparent 50%
        );
    }
  }

  .discover-spotlight-cover {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;
    opacity: 0;
    transition: opacity 600ms ease-in-out;

    &.is-active {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .discover-spotlight-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gap-xs);
    max-width: var(--ni-520);
    padding: var(--gap-l);
    color: var(--trakttime-overlay-text-primary);

    @include for-desktop {
      padding: var(--gap-xl);
    }
  }

  .discover-spotlight-eyebrow {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--purple-300);
  }

  .discover-spotlight-title {
    font-family: var(--trakttime-font-heading);
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.05;
    color: inherit;
    text-decoration: none;

    @include for-desktop {
      font-size: 2.5rem;
    }
  }

  .discover-spotlight-meta {
    font-size: 0.875rem;
    color: var(--trakttime-overlay-text-secondary);
  }

  .discover-spotlight-overview {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--trakttime-overlay-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .discover-spotlight-action {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    height: var(--ni-44);
    margin-top: var(--gap-xs);
    padding: 0 var(--gap-l);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--shade-10);
    color: var(--shade-1000);
    font: inherit;
    font-weight: 600;
    cursor: pointer;

    svg {
      width: var(--trakttime-icon-sm);
      height: var(--trakttime-icon-sm);
    }

    &.is-watchlisted {
      background: var(--trakttime-accent);
      color: var(--trakttime-accent-foreground);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .discover-spotlight-dots {
    position: absolute;
    right: var(--gap-l);
    bottom: var(--gap-l);
    display: flex;
    gap: var(--gap-xxs);
  }

  .discover-spotlight-dot {
    width: var(--ni-8);
    height: var(--ni-8);
    padding: 0;
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--shade-10) 40%, transparent);
    cursor: pointer;
    transition:
      width var(--transition-increment) ease-in-out,
      background-color var(--transition-increment) ease-in-out;

    &.is-active {
      width: var(--ni-24);
      background: var(--shade-10);
    }
  }
</style>
