<script lang="ts">
  import { toTranslatedGenre } from '$lib/utils/formatting/string/toTranslatedGenre.ts';

  type Props = {
    genres: ReadonlyArray<string>;
    limit?: number;
  };

  const { genres, limit = 4 }: Props = $props();
  const visible = $derived(genres.slice(0, limit));
</script>

{#if visible.length > 0}
  <div class="summary-genres" role="list">
    {#each visible as genre, i (`${genre}-${i}`)}
      <span class="summary-genre-pill" role="listitem">
        {toTranslatedGenre(genre)}
      </span>
    {/each}
  </div>
{/if}

<style lang="scss">
  .summary-genres {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .summary-genre-pill {
    background: var(--color-card-background);
    color: var(--color-text-primary);
    border-radius: var(--trakttime-radius-pill);
    padding: var(--gap-xxs) var(--gap-s);
    font-size: 0.8125rem;
    font-weight: 500;
  }
</style>
