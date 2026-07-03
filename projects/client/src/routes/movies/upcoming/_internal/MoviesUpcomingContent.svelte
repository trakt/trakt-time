<script lang="ts">
  import { languageTag } from '$lib/features/i18n/index.ts';
  import { daysFromToday, toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import MovieCard from '$lib/components/media-card/MovieCard.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { upcomingMoviesQuery } from '$lib/requests/queries/calendars/upcomingMoviesQuery.ts';
  import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';

  const DAYS_TO_FETCH = 90;
  const startDate = toLocalDayKey(new Date());
  const locale = languageTag();

  const query = useQuery(upcomingMoviesQuery({ startDate, days: DAYS_TO_FETCH, filter: {} }));

  function toGroupLabel(dateKey: string): string {
    const diffDays = daysFromToday(dateKey);

    if (diffDays <= 0) return 'TODAY';

    const date = new Date(dateKey + 'T12:00:00');

    if (diffDays <= 7) {
      return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date).toUpperCase();
    }

    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date).toUpperCase();
  }

  type MovieGroup = { label: string; items: MovieEntry[] };

  const groups = $derived.by<MovieGroup[]>(() => {
    const entries = $query.data ?? [];
    const grouped = new Map<string, MovieEntry[]>();

    for (const entry of entries) {
      const key = toLocalDayKey(entry.effectiveReleaseDate ?? entry.releaseDate);
      const bucket = grouped.get(key) ?? [];
      bucket.push(entry);
      grouped.set(key, bucket);
    }

    return [...grouped.entries()].map(([key, items]) => ({
      label: toGroupLabel(key),
      items,
    }));
  });
</script>

<div class="upcoming-page">
  {#if $query.isPending}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if groups.length === 0}
    <div class="empty-state">
      <p>No upcoming movies in the next {DAYS_TO_FETCH} days.</p>
    </div>
  {:else}
    {#each groups as group (group.label)}
      <GroupHeader label={group.label} />
      {#each group.items as entry (entry.id)}
        <MovieCard {entry} />
      {/each}
    {/each}
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .upcoming-page {
    display: flex;
    flex-direction: column;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
</style>
