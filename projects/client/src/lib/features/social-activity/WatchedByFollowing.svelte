<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import UserRow from '$lib/features/social/UserRow.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaSocialQueryTarget } from '$lib/requests/queries/media/mediaSocialQuery.ts';
  import { formatStars, toStarsFromUserRating } from '$lib/utils/rating/toStars.ts';
  import { toSocialDetail } from './toSocialDetail.ts';
  import { useMediaSocial } from './useMediaSocial.ts';

  type Props = {
    target: MediaSocialQueryTarget;
    title: string;
  };

  const { target, title }: Props = $props();

  const AVATAR_PREVIEW_COUNT = 3;

  const { entries } = $derived(useMediaSocial(target));

  let isSheetOpen = $state(false);

  const watchedCount = $derived(
    $entries.filter((entry) => entry.watched != null).length,
  );
  const summary = $derived(
    [
      watchedCount > 0 ? `${watchedCount} ${m.tag_text_watched()}` : null,
      $entries.length > watchedCount
        ? `${$entries.length - watchedCount} ${m.tag_text_watchlisted()}`
        : null,
    ]
      .filter(Boolean)
      .join(' · '),
  );

  const toRating = (rating: number) =>
    formatStars({ value: toStarsFromUserRating(rating), locale: languageTag() });
</script>

{#if $entries.length > 0}
  <button
    type="button"
    class="watched-by"
    aria-label={m.link_label_view_social_activities({ title })}
    onclick={() => (isSheetOpen = true)}
  >
    <span class="watched-by-avatars">
      {#each $entries.slice(0, AVATAR_PREVIEW_COUNT) as entry (entry.key)}
        <UserAvatar name={entry.user.username} src={entry.user.avatar.url} size="xs" />
      {/each}
    </span>
    <span class="watched-by-text">{m.text_watched_by_following()}</span>
    <span class="watched-by-count">{$entries.length}</span>
  </button>
{/if}

{#if isSheetOpen}
  <BottomSheet
    title={m.list_title_social_activity()}
    subtitle={summary}
    onClose={() => (isSheetOpen = false)}
  >
    <div class="watched-by-list">
      {#each $entries as entry (entry.key)}
        <UserRow
          profile={entry.user}
          detail={toSocialDetail({ entry, locale: languageTag() })}
        >
          {#snippet action()}
            {#if entry.watched?.rating}
              <span class="watched-by-rating">
                <StarIcon fill="full" />
                {toRating(entry.watched.rating.rating)}
              </span>
            {/if}
          {/snippet}
        </UserRow>
      {/each}
    </div>
  </BottomSheet>
{/if}

<style lang="scss">
  .watched-by {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    align-self: flex-start;
    max-width: 100%;
    padding: var(--ni-4) var(--gap-s) var(--ni-4) var(--ni-4);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--color-text-emphasis) 35%, transparent);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }

    &:active {
      opacity: 0.8;
    }
  }

  .watched-by-avatars {
    display: flex;
    flex-shrink: 0;

    > :global(*) {
      box-shadow: 0 0 0 var(--ni-2) var(--color-card-background);
    }

    > :global(* + *) {
      margin-inline-start: calc(var(--gap-xs) * -1);
    }
  }

  .watched-by-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .watched-by-count {
    flex-shrink: 0;
    min-width: var(--ni-22);
    padding: 0 var(--gap-xxs);
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: var(--ni-22);
    text-align: center;
  }

  .watched-by-list {
    display: flex;
    flex-direction: column;
    margin-inline: calc(var(--gap-m) * -1);

    > :global(.user-row + .user-row) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }

  .watched-by-rating {
    display: inline-flex;
    align-items: center;
    gap: var(--ni-2);
    padding: 0 var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--trakttime-accent) 16%, transparent);
    color: var(--color-text-emphasis);
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: var(--ni-28);

    :global(svg) {
      width: var(--ni-14);
      height: var(--ni-14);
    }
  }
</style>
