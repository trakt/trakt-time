<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import { toCompactAge } from '$lib/utils/date/toCompactAge.ts';
  import { episodeActivityTitle } from '$lib/utils/intl/episodeActivityTitle.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import type { RecentWatch } from './useProfileActivity.ts';

  const { recent }: { recent: ReadonlyArray<RecentWatch> } = $props();

  const toCard = (entry: RecentWatch) =>
    entry.type === 'movie'
      ? {
        title: entry.movie.title,
        detail: entry.movie.year ? `${entry.movie.year}` : '',
        cover: entry.movie.cover.url.thumb,
        href: UrlBuilder.movie(entry.movie.slug),
      }
      : {
        title: entry.show.title,
        detail: episodeActivityTitle(entry.episode),
        cover: entry.show.cover.url.thumb,
        href: UrlBuilder.episode(
          entry.show.slug,
          entry.episode.season,
          entry.episode.number,
        ),
      };

  const age = (date: Date) =>
    toCompactAge({ date, now: new Date(), locale: languageTag() });
</script>

<div class="recent-row">
  {#each recent as entry (entry.key)}
    {@const card = toCard(entry)}
    <a class="recent-card" href={card.href}>
      <span class="recent-cover">
        <CrossOriginImage src={card.cover} alt="" />
      </span>
      <span class="recent-title">{card.title}</span>
      <span class="recent-detail">
        {[card.detail, age(entry.watchedAt)].filter(Boolean).join(' · ')}
      </span>
    </a>
  {/each}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .recent-row {
    @include scrollable-row;
    padding: 0 var(--trakttime-page-gutter);
  }

  .recent-card {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    flex-shrink: 0;
    width: var(--ni-220);
    color: inherit;
    text-decoration: none;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
      border-radius: var(--border-radius-m);
    }
  }

  .recent-cover {
    display: block;
    aspect-ratio: 16 / 9;
    margin-bottom: var(--ni-4);
    border-radius: var(--border-radius-m);
    overflow: hidden;
    background: var(--color-card-background);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .recent-title,
  .recent-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .recent-detail {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  @include for-desktop {
    .recent-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--ni-220), 1fr));
      gap: var(--gap-l) var(--gap-m);
      overflow: visible;
    }

    .recent-card {
      width: auto;
    }

    .recent-card:nth-child(n + 9) {
      display: none;
    }
  }
</style>
