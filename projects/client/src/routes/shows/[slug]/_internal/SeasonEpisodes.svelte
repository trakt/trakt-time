<script lang="ts">
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { latestAiredSeason, seasonMilestone } from '$lib/features/delight/delightRules.ts';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { resolve } from '$lib/utils/store/resolve.ts';
  import { showSeasonEpisodesQuery } from '$lib/requests/queries/shows/showSeasonEpisodesQuery.ts';
  import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
  import type { Season } from '$lib/requests/models/Season.ts';
  import { useWatchedUntilHere } from '$lib/sections/media-actions/mark-as-watched/watched-until-here/useWatchedUntilHere.ts';
  import SeasonEpisodeRow from './SeasonEpisodeRow.svelte';

  type Props = {
    slug: string;
    season: number;
    showId: number;
    showTitle: string;
    episodeCount: number;
    seasons: ReadonlyArray<Season>;
    hasEnded: boolean;
    onMilestone: (milestone: 'caught-up' | 'season-complete') => void;
  };
  const {
    slug,
    season,
    showId,
    showTitle,
    episodeCount,
    seasons,
    hasEnded,
    onMilestone,
  }: Props = $props();

  const { history } = useUser();

  const query = $derived(useQuery(showSeasonEpisodesQuery({ slug, season })));
  const episodes = $derived($query.data ?? []);
  const isLoading = $derived($query.isLoading);

  const { offerWatchedUntilHere } = $derived(useWatchedUntilHere({ slug, showId }));

  async function checkMilestone(episode: EpisodeEntry) {
    const now = new Date();
    const watched = (await resolve(history).catch(() => null))?.shows.get(showId)?.episodes ?? [];
    const milestone = seasonMilestone({
      episodes: episodes.map(({ id, effectiveReleaseDate }) => ({
        id,
        releaseDate: effectiveReleaseDate,
      })),
      watchedIds: new Set([episode.id, ...watched.map(({ episodeId }) => episodeId)]),
      isLatestAiredSeason: latestAiredSeason({ seasons, now }) === season,
      hasEnded,
      now,
    });

    if (milestone) onMilestone(milestone);
  }

  const onWatched = (episode: EpisodeEntry) => {
    checkMilestone(episode);
    offerWatchedUntilHere({ episode, currentSeasonEpisodes: episodes, seasons });
  };

  const skeletonCount = $derived(Math.max(episodeCount, 1));
</script>

<div class="season-episodes">
  {#if isLoading && episodes.length === 0}
    <ol class="episode-list" aria-hidden="true">
      {#each Array(skeletonCount) as _, i (`es-${i}`)}
        <li class="episode-row-skeleton">
          <div class="episode-skeleton-thumb"></div>
          <div class="episode-skeleton-text">
            <div class="episode-skeleton-line episode-skeleton-line--title"></div>
            <div class="episode-skeleton-line episode-skeleton-line--number"></div>
          </div>
          <div class="episode-skeleton-btn"></div>
        </li>
      {/each}
    </ol>
  {:else}
    <ol class="episode-list">
      {#each episodes as episode (episode.id)}
        <SeasonEpisodeRow {slug} {episode} {showId} {showTitle} {onWatched} />
      {/each}
    </ol>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .season-episodes {
    background: var(--color-card-background);
    border-top: var(--ni-1) solid var(--color-border);
  }

  .episode-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Mirrors the SeasonEpisodeRow footprint: thumb + two text lines + toggle. */
  .episode-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .episode-skeleton-thumb {
    flex-shrink: 0;
    width: var(--ni-104);
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius-m);
    @include shimmer-bg-elevated;
  }

  .episode-skeleton-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .episode-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    &--number {
      width: var(--ni-24);
      height: 1rem;
      animation-delay: 0.1s;
    }

    &--title {
      width: 60%;
      height: 1.125rem;
      animation-delay: 0.15s;
    }
  }

  .episode-skeleton-btn {
    flex-shrink: 0;
    width: var(--trakttime-watched-btn-size-compact);
    height: var(--trakttime-watched-btn-size-compact);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
