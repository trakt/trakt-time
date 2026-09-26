<script lang="ts">
  import { page } from '$app/state';
  import { replaceSearchParam } from '$lib/utils/url/replaceSearchParam.ts';
  import { toSearchParamValue } from '$lib/utils/url/toSearchParamValue.ts';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import {
    type UserCommentEntry,
    userCommentsQuery,
  } from '$lib/requests/queries/users/userCommentsQuery.ts';
  import {
    type UserRatingEntry,
    userRatingsQuery,
  } from '$lib/requests/queries/users/userRatingsQuery.ts';
  import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
  import { episodeActivityTitle } from '$lib/utils/intl/episodeActivityTitle.ts';
  import { formatStars, toStarsFromUserRating } from '$lib/utils/rating/toStars.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import ProfileListRow from './ProfileListRow.svelte';

  const { slug }: { slug: string } = $props();

  const PREVIEW_COUNT = 3;

  const ACTIVITY_TABS = ['ratings', 'reviews'] as const;

  const tab = $derived(
    toSearchParamValue({
      value: page.url.searchParams.get('activity'),
      options: ACTIVITY_TABS,
      fallback: 'ratings',
    }),
  );

  const ratings = $derived(
    usePaginatedListQuery(userRatingsQuery({ slug, limit: PREVIEW_COUNT })).list,
  );
  const comments = $derived(
    usePaginatedListQuery(userCommentsQuery({ slug, limit: PREVIEW_COUNT })).list,
  );

  const options = [
    { value: 'ratings' as const, label: m.button_text_activity_ratings() },
    { value: 'reviews' as const, label: m.button_text_activity_reviews() },
  ];

  const toRatingRow = (entry: UserRatingEntry) => {
    switch (entry.type) {
      case 'movie':
        return {
          href: UrlBuilder.movie(entry.movie.slug),
          poster: entry.movie.poster.url.thumb,
          title: entry.movie.title,
          subtitle: entry.movie.year ? `${entry.movie.year}` : '',
        };
      case 'show':
        return {
          href: UrlBuilder.show(entry.show.slug),
          poster: entry.show.poster.url.thumb,
          title: entry.show.title,
          subtitle: entry.show.year ? `${entry.show.year}` : '',
        };
      case 'episode':
        return {
          href: UrlBuilder.episode(
            entry.show.slug,
            entry.episode.season,
            entry.episode.number,
          ),
          poster: entry.show.poster.url.thumb,
          title: entry.show.title,
          subtitle: episodeActivityTitle(entry.episode),
        };
    }
  };

  const toCommentRow = (entry: UserCommentEntry) => ({
    href: entry.type === 'episode'
      ? UrlBuilder.episode(
        entry.media.slug,
        entry.episode.season,
        entry.episode.number,
      )
      : UrlBuilder.media(entry.type, entry.media.slug),
    poster: entry.media.poster.url.thumb,
    title: entry.media.title,
    subtitle: entry.comment.isSpoiler ? m.text_reveal_spoiler() : entry.comment.comment,
  });

  const toStars = (rating: number) =>
    formatStars({ value: toStarsFromUserRating(rating), locale: languageTag() });
</script>

<div class="activity-toggle">
  <SegmentedControl
    label={m.list_title_activity()}
    value={tab}
    {options}
    onChange={(value) =>
      replaceSearchParam({ url: page.url, key: 'activity', value })}
  />
</div>

{#if tab === 'ratings'}
  {#if $ratings.length === 0}
    <p class="activity-empty">{m.text_no_activity()}</p>
  {:else}
    <div class="activity-card">
      {#each $ratings.slice(0, PREVIEW_COUNT) as entry (entry.key)}
        {@const row = toRatingRow(entry)}
        <ProfileListRow
          href={row.href}
          posterUrl={row.poster}
          title={row.title}
          subtitle={row.subtitle}
        >
          {#snippet trailing()}
            <span class="activity-rating">
              <StarIcon fill="full" />
              {toStars(entry.rating)}
            </span>
          {/snippet}
        </ProfileListRow>
      {/each}
    </div>
  {/if}
{:else if $comments.length === 0}
  <p class="activity-empty">{m.text_no_activity()}</p>
{:else}
  <div class="activity-card">
    {#each $comments.slice(0, PREVIEW_COUNT) as entry (entry.key)}
      {@const row = toCommentRow(entry)}
      <ProfileListRow
        href={row.href}
        posterUrl={row.poster}
        title={row.title}
        subtitle={row.subtitle}
      />
    {/each}
  </div>
{/if}

<style lang="scss">
  .activity-toggle {
    padding: 0 var(--trakttime-page-gutter) var(--gap-s);
  }

  .activity-card {
    display: flex;
    flex-direction: column;
    margin: 0 var(--trakttime-page-gutter);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    overflow: hidden;

    > :global(* + *) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .activity-empty {
    margin: 0;
    padding: var(--gap-l) var(--trakttime-page-gutter);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
  }

  .activity-rating {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: var(--ni-2);
    font-family: var(--trakttime-font-heading);
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-text-primary);

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
      color: var(--color-text-emphasis);
    }
  }
</style>
