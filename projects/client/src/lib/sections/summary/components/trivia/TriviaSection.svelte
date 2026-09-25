<script lang="ts">
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaType } from '$lib/requests/models/MediaType.ts';
  import { Marked } from 'marked';
  import TriviaDrawer from './_internal/TriviaDrawer.svelte';
  import TriviaSummaryCardSkeleton from './_internal/TriviaSummaryCardSkeleton.svelte';
  import { toTriviaCategoryLabel } from './_internal/toTriviaCategoryLabel.ts';
  import { useTrivia } from './_internal/useTrivia.ts';

  const MAX_CARDS = 6;

  const { type, slug }: { type: MediaType; slug: string } = $props();

  let drawerOpen = $state(false);
  $effect(() => {
    slug;
    drawerOpen = false;
  });

  const marked = new Marked();

  const { items, summary, isLoading } = $derived(useTrivia({ slug, type }));
  const cards = $derived($items.slice(0, MAX_CARDS));
</script>

{#if $isLoading}
  <section class="summary-section" aria-hidden="true">
    <h2 class="summary-section-title">{m.list_title_trivia()}</h2>
    <TriviaSummaryCardSkeleton />
  </section>
{:else if cards.length > 0}
  <section class="summary-section">
    <h2 class="summary-section-title">{m.list_title_trivia()}</h2>

    <ul class="trivia-row">
      {#each cards as fact (fact.key)}
        <li>
          <button
            type="button"
            class="trivia-card"
            class:is-spoiler={fact.isSpoiler}
            onclick={() => (drawerOpen = true)}
            aria-label={m.button_label_view_trivia()}
          >
            <span class="trivia-category">
              <SparkleIcon />
              {toTriviaCategoryLabel(fact.category)}
            </span>
            <div class="trivia-text">
              {@html marked.parse(fact.text)}
            </div>
            {#if fact.isSpoiler}
              <span class="trivia-spoiler">{m.text_reveal_spoiler()}</span>
            {/if}
          </button>
        </li>
      {/each}
      <li>
        <button
          type="button"
          class="trivia-card trivia-card--more"
          onclick={() => (drawerOpen = true)}
        >
          <span>{m.button_label_view_trivia()}</span>
          <ChevronRightIcon />
        </button>
      </li>
    </ul>
  </section>

  {#if drawerOpen}
    <TriviaDrawer
      items={$items}
      summary={$summary}
      onClose={() => (drawerOpen = false)}
    />
  {/if}
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .trivia-row {
    @include scrollable-row(var(--gap-s));
    list-style: none;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--gap-m);

    li {
      flex-shrink: 0;
      scroll-snap-align: start;
    }
  }

  .trivia-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    width: min(78vw, var(--ni-280));
    height: var(--trakttime-trivia-card-height);
    padding: var(--gap-m);
    box-sizing: border-box;
    overflow: hidden;
    border: none;
    border-radius: var(--trakttime-radius-card);
    background: var(--background-vip-drawer);
    color: var(--color-text-primary);
    font: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .trivia-category {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xxs);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--trakttime-accent);

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }
  }

  .trivia-text {
    font-size: 0.9375rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;

    :global(p) {
      margin: 0;
    }
  }

  .trivia-card.is-spoiler .trivia-text {
    filter: blur(6px);
  }

  .trivia-spoiler {
    position: absolute;
    inset: auto var(--gap-m) var(--gap-m);
    padding: var(--gap-xs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    font-size: 0.8125rem;
    font-weight: 600;
    text-align: center;
  }

  .trivia-card--more {
    width: var(--ni-136);
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xxs);
    background: var(--color-card-background);
    color: var(--trakttime-accent);
    font-weight: 600;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }
</style>
