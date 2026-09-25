<script lang="ts">
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
  import ProfileImage from './_internal/ProfileImage.svelte';
  import ProfileHeaderSkeleton from './_internal/ProfileHeaderSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { userProfileQuery } from '$lib/requests/queries/users/userProfileQuery.ts';
  import { userStatsQuery } from '$lib/requests/queries/users/userStatsQuery.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';
  import { personalListsQuery } from '$lib/requests/queries/users/personalListsQuery.ts';
  import { useFavoritesList } from '$lib/sections/lists/stores/useFavoritesList.ts';
  import { useWatchList } from '$lib/sections/lists/watchlist/useWatchList.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';

  type Props = {
    slug: string;
    isOwner: boolean;
  };

  const { slug, isOwner }: Props = $props();

  const LISTS_PREVIEW_COUNT = 5;

  const profileQuery = $derived(useQuery(userProfileQuery({ slug })));
  const profile = $derived($profileQuery.data ?? null);

  const statsQuery = $derived(useQuery(userStatsQuery({ slug })));
  const stats = $derived($statsQuery.data ?? null);

  /*
   * /v3/users/me/lists is a fork-private endpoint that only resolves for the
   * authenticated user, so non-owners must hit the public /users/:id/lists
   * route via personalListsQuery. Both queries map to the same UserList shape.
   */
  const listsQuery = $derived(
    isOwner
      ? useQuery(userListsQuery())
      : useQuery(personalListsQuery({ slug })),
  );
  const lists = $derived($listsQuery.data ?? []);
  const listsLoading = $derived($listsQuery.isLoading);

  const watchlistShowsResult = $derived(
    // intent 'default': profile previews show the raw watchlist. Anything
    // else filters it through the VIEWER's in-progress list, hiding the
    // profile owner's titles based on the wrong user's activity.
    useWatchList({ slug, type: 'show', limit: 10, sortBy: 'added', intent: 'default' }),
  );
  const watchlistShows = $derived(watchlistShowsResult.list);
  const watchlistShowsLoading = $derived(watchlistShowsResult.isLoading);

  const watchlistMoviesResult = $derived(
    useWatchList({
      slug,
      type: 'movie',
      limit: 10,
      sortBy: 'added',
      intent: 'default',
    }),
  );
  const watchlistMovies = $derived(watchlistMoviesResult.list);
  const watchlistMoviesLoading = $derived(watchlistMoviesResult.isLoading);

  const favoriteShowsResult = $derived(
    useFavoritesList({ slug, type: 'show', limit: 10 }),
  );
  const favoriteShows = $derived(favoriteShowsResult.list);
  const favoriteShowsLoading = $derived(favoriteShowsResult.isLoading);

  const favoriteMoviesResult = $derived(
    useFavoritesList({ slug, type: 'movie', limit: 10 }),
  );
  const favoriteMovies = $derived(favoriteMoviesResult.list);
  const favoriteMoviesLoading = $derived(favoriteMoviesResult.isLoading);

  const tvTime = $derived.by(() => {
    if (!stats) return null;
    const totalMinutes = stats.episodes.minutes;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const hours = totalHours % 24;
    return { months, days, hours };
  });

  const listsHref = $derived(
    isOwner ? '/profile/me/lists' : `/profile/${slug}/lists`,
  );

  const showsWatchlistHref = $derived(isOwner ? '/shows/watchlist' : null);
  const moviesWatchlistHref = $derived(isOwner ? '/movies/watchlist' : null);
</script>

{#snippet skeletonRow(prefix: string)}
  <div class="poster-row-skeleton" aria-hidden="true">
    {#each Array(5) as _, i (`${prefix}-${i}`)}
      <PosterSkeleton />
    {/each}
  </div>
{/snippet}

{#snippet emptyRow(text: string, showImportCta: boolean = false)}
  <div class="poster-row-empty">
    <p>{text}</p>
    {#if showImportCta && isOwner}
      <CtaLink href="/settings">
        {m.welcome_tvtime_import_cta()}
      </CtaLink>
    {/if}
  </div>
{/snippet}

{#if !profile}
  <ProfileHeaderSkeleton />
{:else}
  <div
    class="profile-header"
    class:has-cover={Boolean(profile.cover?.url)}
    style:--cover-url={profile.cover?.url ? `url(${profile.cover.url})` : 'none'}
  >
    <div class="profile-cover"></div>
    <div class="profile-identity">
      <div class="profile-avatar-row">
        <div class="profile-avatar">
          <ProfileImage
            name={profile.username}
            src={profile.avatar.url}
            isEditable={isOwner}
          />
        </div>
        {#if isOwner}
          <a
            href="/settings"
            class="profile-settings-btn icon-button-round"
            aria-label={m.page_title_settings()}
            data-sveltekit-preload-data="hover"
          >
            <SettingsIcon />
          </a>
        {/if}
      </div>
      <div class="profile-meta">
        <h1 class="profile-username">{profile.name?.full || profile.username}</h1>
        <p class="profile-name">@{profile.username}</p>
        <p class="profile-about">{profile.about ?? ''}</p>
      </div>
    </div>
  </div>
{/if}

{#snippet countCell(value: number | undefined, label: string)}
  <div class="count-cell">
    {#if value != null}
      <span class="count-value">{value.toLocaleString()}</span>
    {:else}
      <span class="count-value count-value--skeleton" aria-hidden="true"></span>
    {/if}
    <span class="count-label">{label}</span>
  </div>
{/snippet}

<div class="profile-counts">
  {@render countCell(stats?.network.following, m.text_count_following())}
  {@render countCell(stats?.network.followers, m.text_count_followers())}
  {@render countCell(stats?.episodes.plays, m.text_count_plays())}
</div>

<section class="profile-section">
  <div class="section-header">
    <h2 class="section-title">{m.header_stats()}</h2>
  </div>
  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-card-label">{m.stat_label_tv_time()}</span>
      <div class="tv-time">
        {#if tvTime}
          {#if tvTime.months > 0}
            <span class="tv-unit"><strong>{tvTime.months}</strong> {m.text_unit_months()}</span>
          {/if}
          {#if tvTime.days > 0 || tvTime.months > 0}
            <span class="tv-unit"><strong>{tvTime.days}</strong> {m.text_unit_days()}</span>
          {/if}
          <span class="tv-unit"><strong>{tvTime.hours}</strong> {m.text_unit_hours()}</span>
        {:else}
          <span class="stat-skeleton stat-skeleton--time" aria-hidden="true"></span>
        {/if}
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-card-label">{m.stat_label_episodes_watched()}</span>
      {#if stats}
        <span class="stat-big">{stats.episodes.plays.toLocaleString()}</span>
      {:else}
        <span class="stat-skeleton stat-skeleton--big" aria-hidden="true"></span>
      {/if}
    </div>
    <div class="stat-card">
      <span class="stat-card-label">{m.stat_label_movies_watched()}</span>
      {#if stats}
        <span class="stat-big">{stats.movies.plays.toLocaleString()}</span>
      {:else}
        <span class="stat-skeleton stat-skeleton--big" aria-hidden="true"></span>
      {/if}
    </div>
    <div class="stat-card">
      <span class="stat-card-label">{m.stat_label_shows_watched()}</span>
      {#if stats}
        <span class="stat-big">{stats.shows.watched.toLocaleString()}</span>
      {:else}
        <span class="stat-skeleton stat-skeleton--big" aria-hidden="true"></span>
      {/if}
    </div>
  </div>
</section>

<section class="profile-section">
  {#if lists.length > LISTS_PREVIEW_COUNT}
    <a
      href={listsHref}
      class="section-header"
      aria-label={m.button_label_view_all_lists()}
    >
      <h2 class="section-title">
        {isOwner ? m.header_my_lists() : m.page_title_lists()}
      </h2>
      <span class="chevron"><ChevronRightIcon /></span>
    </a>
  {:else}
    <div class="section-header">
      <h2 class="section-title">
        {isOwner ? m.header_my_lists() : m.page_title_lists()}
      </h2>
    </div>
  {/if}
  {#if listsLoading && lists.length === 0}
    <div class="lists-grid" aria-hidden="true">
      {#each Array(3) as _, i (`l-${i}`)}
        <div class="list-card list-card-skeleton"></div>
      {/each}
    </div>
  {:else if lists.length === 0}
    <div class="lists-empty">
      <p>{m.text_no_lists()}</p>
    </div>
  {:else}
    <div class="lists-grid">
      {#each lists.slice(0, LISTS_PREVIEW_COUNT) as list (list.id)}
        <a
          href="/lists/{list.id}?name={encodeURIComponent(list.name)}"
          class="list-card"
        >
          <span class="list-name">{list.name}</span>
          <span class="list-count">{list.count} {m.text_items_unit()}</span>
        </a>
      {/each}
    </div>
  {/if}
</section>

<section class="profile-section">
  {#if showsWatchlistHref}
    <a href={showsWatchlistHref} class="section-header" aria-label={m.button_label_view_all_watchlisted_shows()}>
      <h2 class="section-title">{m.page_title_shows()}</h2>
      <span class="chevron"><ChevronRightIcon /></span>
    </a>
  {:else}
    <div class="section-header">
      <h2 class="section-title">{m.page_title_shows()}</h2>
    </div>
  {/if}
  {#if $watchlistShowsLoading && $watchlistShows.length === 0}
    {@render skeletonRow('s')}
  {:else if $watchlistShows.length === 0}
    {@render emptyRow(m.text_empty_show_watchlist(), true)}
  {:else}
    <div class="poster-row" role="list">
      {#each $watchlistShows as item (item.key)}
        {#if item.type === 'show'}
          <PosterCard
            type="show"
            href={UrlBuilder.show(item.entry.slug)}
            id={item.entry.id}
            title={item.entry.title}
            posterUrl={item.entry.poster.url.thumb}
          />
        {/if}
      {/each}
    </div>
  {/if}
</section>

<section class="profile-section">
  <div class="section-header">
    <h2 class="section-title section-title--heart">
      <span class="heart-icon"><HeartIcon /></span>
      {m.header_favorite_shows()}
    </h2>
  </div>
  {#if $favoriteShowsLoading && $favoriteShows.length === 0}
    {@render skeletonRow('fs')}
  {:else if $favoriteShows.length === 0}
    {@render emptyRow(m.text_no_favorite_shows())}
  {:else}
    <div class="poster-row" role="list">
      {#each $favoriteShows as item (item.key)}
        <PosterCard
          type={item.item.type}
          href={item.item.type === 'show' ? UrlBuilder.show(item.item.slug) : UrlBuilder.movie(item.item.slug)}
          id={item.item.id}
          title={item.item.title}
          posterUrl={item.item.poster.url.thumb}
          mode="favorite"
        />
      {/each}
    </div>
  {/if}
</section>

<section class="profile-section">
  {#if moviesWatchlistHref}
    <a href={moviesWatchlistHref} class="section-header" aria-label={m.button_label_view_all_watchlisted_movies()}>
      <h2 class="section-title">{m.page_title_movies()}</h2>
      <span class="chevron"><ChevronRightIcon /></span>
    </a>
  {:else}
    <div class="section-header">
      <h2 class="section-title">{m.page_title_movies()}</h2>
    </div>
  {/if}
  {#if $watchlistMoviesLoading && $watchlistMovies.length === 0}
    {@render skeletonRow('m')}
  {:else if $watchlistMovies.length === 0}
    {@render emptyRow(m.text_empty_movie_watchlist(), true)}
  {:else}
    <div class="poster-row" role="list">
      {#each $watchlistMovies as item (item.key)}
        {#if item.type === 'movie'}
          <PosterCard
            type="movie"
            href={UrlBuilder.movie(item.entry.slug)}
            id={item.entry.id}
            title={item.entry.title}
            posterUrl={item.entry.poster.url.thumb}
          />
        {/if}
      {/each}
    </div>
  {/if}
</section>

<section class="profile-section">
  <div class="section-header">
    <h2 class="section-title section-title--heart">
      <span class="heart-icon"><HeartIcon /></span>
      {m.header_favorite_movies()}
    </h2>
  </div>
  {#if $favoriteMoviesLoading && $favoriteMovies.length === 0}
    {@render skeletonRow('fm')}
  {:else if $favoriteMovies.length === 0}
    {@render emptyRow(m.text_no_favorite_movies())}
  {:else}
    <div class="poster-row" role="list">
      {#each $favoriteMovies as item (item.key)}
        <PosterCard
          type={item.item.type}
          href={item.item.type === 'show' ? UrlBuilder.show(item.item.slug) : UrlBuilder.movie(item.item.slug)}
          id={item.item.id}
          title={item.item.title}
          posterUrl={item.item.poster.url.thumb}
          mode="favorite"
        />
      {/each}
    </div>
  {/if}
</section>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .profile-header {
    display: flex;
    flex-direction: column;
  }

  .profile-cover {
    height: var(--trakttime-profile-cover-height);
    background-image: var(--cover-url);
    background-size: cover;
    background-position: center;
    background-color: var(--color-card-background);
  }

  /* The avatar overlaps the cover's bottom edge; without a scrim a bright
     cover swallows its ring. */
  .has-cover .profile-cover {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 35%,
        color-mix(in srgb, var(--color-background) 55%, transparent) 78%,
        color-mix(in srgb, var(--color-background) 92%, transparent) 100%
      );
      pointer-events: none;
    }
  }

  .profile-identity {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: 0 var(--gap-m) var(--gap-m);
    margin-top: var(--trakttime-profile-offset);
    position: relative;
  }

  .profile-avatar-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .profile-avatar {
    width: var(--trakttime-avatar-size);
    height: var(--trakttime-avatar-size);
    flex-shrink: 0;
    border-radius: 50%;
    box-shadow: 0 0 0 4px var(--color-background);
  }

  .profile-meta {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    min-width: 0;
  }

  .profile-username {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-settings-btn {
    flex-shrink: 0;
    margin-bottom: var(--gap-xxs);

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }

  .profile-name {
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .profile-about {
    height: 1.25rem;
    margin: var(--gap-xxs) 0 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-counts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs) var(--gap-l);
    padding: 0 var(--gap-m) var(--gap-s);
  }

  .count-cell {
    display: flex;
    align-items: baseline;
    gap: var(--gap-xxs);
  }

  .count-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
  }

  .count-value--skeleton {
    align-self: center;
    width: var(--ni-28);
    height: 1rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg;
  }

  .count-label {
    font-size: 1rem;
    color: var(--color-text-secondary);
  }

  .profile-section {
    padding: var(--gap-m) 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--gap-xxs);
    padding: 0 var(--gap-m) var(--gap-s);
    text-decoration: none;
    color: inherit;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .heart-icon {
    display: inline-flex;
    color: var(--trakttime-accent);
    flex-shrink: 0;

    :global(svg) {
      width: var(--trakttime-icon-sm);
      height: var(--trakttime-icon-sm);
    }
  }

  .chevron {
    display: inline-flex;
    color: var(--color-text-secondary);
    flex-shrink: 0;

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
    }
  }

  .stats-row {
    @include scrollable-row;
    padding: 0 var(--gap-m);
  }

  .stat-card {
    flex-shrink: 0;
    min-width: var(--ni-160);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--gap-l);
    padding: var(--gap-m);
    background: var(--color-card-background);
    border-radius: var(--trakttime-radius-card);
  }

  .stat-card-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .tv-time {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .tv-unit {
    font-size: 0.75rem;
    color: var(--color-text-primary);
    display: flex;
    gap: var(--ni-2);
    align-items: baseline;

    strong {
      font-family: var(--trakttime-font-heading);
      font-size: 1.75rem;
      font-weight: 600;
    }
  }

  .stat-big {
    font-family: var(--trakttime-font-heading);
    font-size: 1.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }

  .stat-skeleton {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    /* Heights track the tv-time strong / .stat-big line boxes. */
    &--time {
      width: var(--ni-160);
      height: 2.1875rem;
    }

    &--big {
      width: var(--ni-64);
      height: 2.1875rem;
    }
  }

  .lists-grid {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: 0 var(--gap-m);
  }

  .list-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--gap-s) var(--gap-m);
    background: var(--color-card-background);
    border-radius: var(--trakttime-radius-card);
    text-decoration: none;
    transition: background-color var(--transition-increment) ease-in-out;

    &:active {
      background: var(--color-floating-background);
    }
  }

  .list-name {
    min-width: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .list-count {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .list-card-skeleton {
    /* Line box of .list-name; padding comes from .list-card. */
    height: 1.25rem;
    @include shimmer-bg;
  }

  .lists-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Reserve same footprint as 3 list cards + their gaps */
    min-height: calc(var(--ni-42) * 3 + var(--gap-xs) * 2);
    padding: 0 var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;

    p {
      margin: 0;
    }
  }

  .poster-row {
    @include scrollable-row;
    padding: 0 var(--gap-m);
  }

  .poster-row-skeleton {
    display: flex;
    gap: var(--gap-s);
    padding: 0 var(--gap-m);
    overflow: hidden;
  }

  .poster-row-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--gap-s);
    /* Match poster-card footprint: 2:3 image + title line-height + gap */
    min-height: calc(var(--trakttime-poster-card-width) * 1.5 + 1rem + var(--gap-xxs));
    padding: 0 var(--gap-m);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;

    p {
      margin: 0;
    }
  }
</style>
