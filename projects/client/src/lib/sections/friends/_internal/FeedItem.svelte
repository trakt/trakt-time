<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import StarIcon from '$lib/components/icons/StarIcon.svelte';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import { languageTag } from '$lib/features/i18n/index.ts';
  import type { SocialActivity } from '$lib/requests/models/SocialActivity.ts';
  import { toCompactAge } from '$lib/utils/date/toCompactAge.ts';
  import { episodeActivityTitle } from '$lib/utils/intl/episodeActivityTitle.ts';
  import { formatStars, toStarsFromUserRating } from '$lib/utils/rating/toStars.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';

  const { activity }: { activity: SocialActivity } = $props();

  const AVATAR_PREVIEW_COUNT = 3;

  const [user] = $derived(activity.users);
  const displayName = $derived(user ? user.name.full || user.username : '');
  const extraUsers = $derived(activity.users.length - 1);

  const media = $derived(
    activity.type === 'movie'
      ? {
        title: activity.movie.title,
        href: UrlBuilder.movie(activity.movie.slug),
        detail: activity.movie.year ? `${activity.movie.year}` : '',
        cover: activity.movie.cover.url.thumb,
      }
      : {
        title: activity.show.title,
        href: UrlBuilder.episode(
          activity.show.slug,
          activity.episode.season,
          activity.episode.number,
        ),
        detail: episodeActivityTitle(activity.episode),
        cover: activity.show.cover.url.thumb,
      },
  );

  const age = $derived(
    toCompactAge({ date: activity.activityAt, now: new Date(), locale: languageTag() }),
  );
  const stars = $derived(
    activity.rating
      ? formatStars({
        value: toStarsFromUserRating(Math.round(activity.rating)),
        locale: languageTag(),
      })
      : null,
  );
</script>

<article class="feed-item">
  {#if user}
    <a
      class="feed-item-avatars"
      href={UrlBuilder.profile.user(user.slug ?? user.username)}
      aria-label={displayName}
    >
      {#each activity.users.slice(0, AVATAR_PREVIEW_COUNT) as person (person.key)}
        <UserAvatar name={person.username} src={person.avatar.url} size="xs" />
      {/each}
    </a>
  {/if}

  <div class="feed-item-body">
    <p class="feed-item-who">
      <span class="feed-item-name">{displayName}</span>
      {#if extraUsers > 0}
        <span class="feed-item-extra">+{extraUsers}</span>
      {/if}
      <span class="feed-item-age">· {age}</span>
    </p>
    <a class="feed-item-title" href={media.href}>{media.title}</a>
    {#if media.detail}
      <p class="feed-item-detail">{media.detail}</p>
    {/if}
    {#if stars}
      <span class="feed-item-rating">
        <StarIcon fill="full" />
        {stars}
      </span>
    {/if}
  </div>

  <a class="feed-item-thumb" href={media.href} tabindex="-1" aria-hidden="true">
    <CrossOriginImage src={media.cover} alt="" />
  </a>
</article>

<style lang="scss">
  .feed-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) var(--ni-120);
    gap: var(--gap-s);
    align-items: start;
    padding: var(--gap-s) var(--trakttime-page-gutter);
  }

  .feed-item-avatars {
    display: flex;
    flex-direction: column;

    > :global(* + *) {
      margin-top: calc(var(--gap-s) * -1);
    }

    > :global(*) {
      box-shadow: 0 0 0 var(--ni-2) var(--color-background);
    }
  }

  .feed-item-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ni-2);
    min-width: 0;
  }

  .feed-item-who {
    display: flex;
    align-items: baseline;
    gap: var(--ni-4);
    max-width: 100%;
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .feed-item-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .feed-item-extra,
  .feed-item-age {
    flex-shrink: 0;
  }

  .feed-item-title {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    text-decoration: none;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .feed-item-detail {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .feed-item-rating {
    display: inline-flex;
    align-items: center;
    gap: var(--ni-2);
    margin-top: var(--ni-2);
    padding: 0 var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background: color-mix(in srgb, var(--trakttime-accent) 16%, transparent);
    color: var(--color-text-emphasis);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.25rem;

    :global(svg) {
      width: var(--ni-12);
      height: var(--ni-12);
    }
  }

  .feed-item-thumb {
    display: block;
    aspect-ratio: 16 / 9;
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
</style>
