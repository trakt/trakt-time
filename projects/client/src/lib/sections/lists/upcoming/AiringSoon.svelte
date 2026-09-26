<script lang="ts">
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { upcomingEpisodesQuery } from '$lib/requests/queries/calendars/upcomingEpisodesQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { toUpcomingWeeks } from './toUpcomingWeeks.ts';
  import { toUpcomingDayLabel } from './upcomingLabels.ts';

  const ENTRY_LIMIT = 6;

  const pad = (value: number) => value.toString().padStart(2, '0');
  const toEpisodeCode = (season: number, episode: number) =>
    `S${pad(season)} E${pad(episode)}`;

  const today = new Date();
  const locale = languageTag();

  const { list } = usePaginatedListQuery(
    upcomingEpisodesQuery({ startDate: toLocalDayKey(today), filter: {} }),
  );

  const days = $derived.by(() => {
    const entries = $list.slice(0, ENTRY_LIMIT);
    return toUpcomingWeeks({
      items: entries,
      toDayKey: (entry) => toLocalDayKey(entry.airDate),
      today,
    }).flatMap((week) => week.days.filter((day) => day.items.length > 0));
  });
</script>

{#if days.length > 0}
  <section class="airing-soon">
    <header class="airing-soon-header">
      <h2>{m.header_airing_soon()}</h2>
      <a href="/shows/upcoming">{m.text_see_all()}</a>
    </header>

    {#each days as day (day.key)}
      <h3 class="airing-soon-day">{toUpcomingDayLabel(day.key, locale, today)}</h3>
      {#each day.items as entry (entry.id)}
        <a
          class="airing-soon-entry"
          href={UrlBuilder.episode(entry.show.slug, entry.season, entry.number)}
        >
          <img src={entry.show.poster.url.thumb} alt="" loading="lazy" />
          <span class="airing-soon-text">
            <span class="airing-soon-title">{entry.show.title}</span>
            <span class="airing-soon-meta">
              {[toEpisodeCode(entry.season, entry.number), entry.show.network]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
          {#if entry.show.airs?.time}
            <time class="airing-soon-time">{entry.show.airs.time}</time>
          {/if}
        </a>
      {/each}
    {/each}
  </section>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .airing-soon {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: var(--gap-m);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .airing-soon-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    a {
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
      text-decoration: none;

      @include for-mouse {
        &:hover {
          color: var(--color-text-primary);
        }
      }
    }
  }

  .airing-soon-day {
    margin: var(--gap-xxs) 0 0;
    font-family: var(--trakttime-font-body);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .airing-soon-entry {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    color: var(--color-text-primary);
    text-decoration: none;

    img {
      width: var(--ni-36);
      aspect-ratio: 2 / 3;
      border-radius: var(--border-radius-xs);
      object-fit: cover;
      flex-shrink: 0;
      background: var(--color-floating-background);
    }
  }

  .airing-soon-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .airing-soon-title,
  .airing-soon-meta {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .airing-soon-title {
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .airing-soon-meta {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .airing-soon-time {
    font-size: 0.8125rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
</style>
