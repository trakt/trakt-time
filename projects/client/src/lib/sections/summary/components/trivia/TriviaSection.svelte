<script lang="ts">
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import SparkleIcon from '$lib/components/icons/SparkleIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaType } from '$lib/requests/models/MediaType.ts';
  import { Marked } from 'marked';
  import TriviaDrawer from './_internal/TriviaDrawer.svelte';
  import TriviaSummaryCardSkeleton from './_internal/TriviaSummaryCardSkeleton.svelte';
  import { useTrivia } from './_internal/useTrivia.ts';

  const MAX_SUMMARY_FACTS = 3;

  const { type, slug }: { type: MediaType; slug: string } = $props();

  let drawerOpen = $state(false);
  $effect(() => {
    slug;
    drawerOpen = false;
  });

  const marked = new Marked();

  const { items, summary, isLoading } = $derived(useTrivia({ slug, type }));
  const visibleFacts = $derived($summary.slice(0, MAX_SUMMARY_FACTS));
</script>

{#if $isLoading}
  <section class="summary-section" aria-hidden="true">
    <h2 class="summary-section-title">{m.list_title_trivia()}</h2>
    <TriviaSummaryCardSkeleton />
  </section>
{:else if visibleFacts.length > 0}
  <section class="summary-section">
    <h2 class="summary-section-title">{m.list_title_trivia()}</h2>

    <button
      type="button"
      class="trivia-summary-card"
      onclick={() => (drawerOpen = true)}
      aria-label={m.button_label_view_trivia()}
    >
      <ul class="trivia-summary-list">
        {#each visibleFacts as fact (fact)}
          <li>
            <SparkleIcon />
            <div class="trivia-summary-fact">
              {@html marked.parse(fact)}
            </div>
          </li>
        {/each}
      </ul>
      <ChevronRightIcon />
    </button>
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
  .trivia-summary-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--gap-s);

    padding: var(--gap-m);
    box-sizing: border-box;

    border: none;
    border-radius: var(--border-radius-m);
    background: var(--background-vip-drawer);

    color: var(--color-text-primary);
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    > :global(svg) {
      flex-shrink: 0;
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      color: var(--color-text-secondary);
    }
  }

  .trivia-summary-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);

    margin: 0;
    padding: 0;
    list-style: none;
    min-width: 0;

    li {
      display: flex;
      align-items: flex-start;
      gap: var(--gap-s);

      > :global(svg) {
        flex-shrink: 0;
        width: var(--trakttime-icon-sm);
        height: var(--trakttime-icon-sm);
        color: var(--color-text-secondary);
      }
    }
  }

  .trivia-summary-fact {
    font-size: 0.875rem;
    line-height: 1.5;

    :global(p) {
      margin: 0;
    }
  }
</style>
