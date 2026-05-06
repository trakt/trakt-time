<script lang="ts">
  import { languageTag } from '$lib/features/i18n/index.ts';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import GroupHeader from '$lib/components/group-header/GroupHeader.svelte';
  import UpcomingEpisodeCard from '$lib/components/media-card/UpcomingEpisodeCard.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { upcomingEpisodesQuery } from '$lib/requests/queries/calendars/upcomingEpisodesQuery.ts';
  import type { UpcomingEpisodeEntry } from '$lib/requests/queries/calendars/upcomingEpisodesQuery.ts';

  const DAYS_TO_FETCH = 90;
  const [startDate] = new Date().toISOString().split('T') as [string];
  const locale = languageTag();

  const query = useQuery(upcomingEpisodesQuery({ startDate, days: DAYS_TO_FETCH, filter: {} }));

  function toDateKey(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  function toGroupLabel(dateKey: string): string {
    const today = toDateKey(new Date());

    if (dateKey === today) return 'TODAY';

    const date = new Date(dateKey + 'T12:00:00');
    const todayDate = new Date();
    const diffMs = date.getTime() - todayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date).toUpperCase();
    }

    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date).toUpperCase();
  }

  type EpisodeGroup = { label: string; items: UpcomingEpisodeEntry[] };

  const groups = $derived.by<EpisodeGroup[]>(() => {
    const entries = $query.data ?? [];
    const grouped = new Map<string, UpcomingEpisodeEntry[]>();

    for (const entry of entries) {
      const key = toDateKey(entry.airDate);
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
      <p>No upcoming episodes in the next {DAYS_TO_FETCH} days.</p>
    </div>
  {:else}
    {#each groups as group (group.label)}
      <GroupHeader label={group.label} />
      {#each group.items as entry (entry.id)}
        <UpcomingEpisodeCard {entry} />
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
