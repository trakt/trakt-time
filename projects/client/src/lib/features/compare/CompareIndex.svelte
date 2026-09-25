<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import CompareHeader from './CompareHeader.svelte';
  import { COMPETITORS } from './competitors.ts';
</script>

<SeoHead
  title={m.compare_index_title()}
  description={m.compare_index_description()}
/>

<main class="compare-index">
  <CompareHeader
    title={m.compare_index_title()}
    intro={m.compare_index_intro()}
  />

  <ul class="compare-index-list">
    {#each COMPETITORS as competitor (competitor.slug)}
      <li>
        <a class="compare-index-link" href="/compare/{competitor.slug}">
          <span class="compare-index-text">
            <span class="compare-index-name">
              {m.compare_title({ name: competitor.name })}
            </span>
            <span class="compare-index-tracks">{competitor.tracks()}</span>
          </span>
          <ChevronRightIcon />
        </a>
      </li>
    {/each}
  </ul>
</main>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .compare-index {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xl);
    padding: var(--gap-xl) var(--gap-m) var(--trakttime-bottom-nav-height);
  }

  .compare-index-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
    overflow: hidden;

    li + li {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .compare-index-link {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    min-height: var(--ni-64);
    padding: var(--gap-s) var(--gap-m);
    color: var(--color-text-secondary);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--transition-increment) ease-in-out;

    &:active {
      background: var(--color-floating-background);
    }

    @include for-mouse {
      &:hover {
        background: var(--color-floating-background);
      }
    }
  }

  .compare-index-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    flex: 1;
    min-width: 0;
  }

  .compare-index-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .compare-index-tracks {
    font-size: 0.8125rem;
  }
</style>
