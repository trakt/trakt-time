<script lang="ts">
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { showSeasonEpisodesQuery } from '$lib/requests/queries/shows/showSeasonEpisodesQuery.ts';
  import SeasonEpisodeRow from './SeasonEpisodeRow.svelte';

  type Props = {
    slug: string;
    season: number;
    showId: number;
    showTitle: string;
  };
  const { slug, season, showId, showTitle }: Props = $props();

  const query = $derived(useQuery(showSeasonEpisodesQuery({ slug, season })));
  const episodes = $derived($query.data ?? []);
  const isLoading = $derived($query.isLoading);
</script>

<div class="season-episodes">
  {#if isLoading && episodes.length === 0}
    <div class="loading-row">
      <LoadingIndicator />
    </div>
  {:else}
    <ol class="episode-list">
      {#each episodes as episode (episode.id)}
        <SeasonEpisodeRow {slug} {episode} {showId} {showTitle} />
      {/each}
    </ol>
  {/if}
</div>

<style lang="scss">
  .season-episodes {
    background: var(--color-card-background);
    border-top: var(--ni-1) solid var(--color-border);
  }

  .loading-row {
    display: flex;
    justify-content: center;
    padding: var(--gap-m);
  }

  .episode-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
