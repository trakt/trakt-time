<script lang="ts">
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
  import ProfileImage from './_internal/ProfileImage.svelte';
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
  <div class="loading-state">
    <LoadingIndicator />
  </div>
{:else}
  <div
    class="profile-header"
    class:has-cover={Boolean(profile.cover?.url)}
    style:--cover-url={profile.cover?.url ? `url(${profile.cover.url})` : 'none'}
  >
    <div class="profile-cover"></div>
    <div class="profile-identity">
      <div class="profile-avatar">
        <ProfileImage
          name={profile.username}
          src={profile.avatar.url}
          isEditable={isOwner}
        />
      </div>
      <div class="profile-meta">
        <div class="profile-username-row">
          <h1 class="profile-username">{profile.username}</h1>
          {#if isOwner}
            <a
              href="/settings"
              class="profile-settings-btn"
              aria-label={m.page_title_settings()}
              data-sveltekit-preload-data="hover"
            >
              <SettingsIcon />
            </a>
          {/if}
        </div>
        {#if profile.name?.full}
          <p class="profile-name">{profile.name.full}</p>
        {/if}
        {#if profile.about}
          <p class="profile-about">{profile.about}</p>
        {/if}
      </div>
    </div>
  </div>

  <div class="profile-counts">
    <div class="count-cell">
      <span class="count-value">{stats?.network.following ?? 0}</span>
      <span class="count-label">{m.text_count_following()}</span>
    </div>
    <div class="count-divider"></div>
    <div class="count-cell">
      <span class="count-value">{stats?.network.followers ?? 0}</span>
      <span class="count-label">{m.text_count_followers()}</span>
    </div>
    <div class="count-divider"></div>
    <div class="count-cell">
      <span class="count-value">{stats?.episodes.plays ?? 0}</span>
      <span class="count-label">{m.text_count_plays()}</span>
    </div>
  </div>

  <section class="profile-section">
    <div class="section-header">
      <h2 class="section-title">{m.header_stats()}</h2>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
        </svg>
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
            <span class="tv-unit stat-placeholder" aria-hidden="true">&mdash;</span>
          {/if}
        </div>
      </div>
      <div class="stat-card">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
        </svg>
        <span class="stat-card-label">{m.stat_label_episodes_watched()}</span>
        <span class="stat-big">{stats?.episodes.plays.toLocaleString() ?? '0'}</span>
      </div>
      <div class="stat-card">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
        </svg>
        <span class="stat-card-label">{m.stat_label_movies_watched()}</span>
        <span class="stat-big">{stats?.movies.plays.toLocaleString() ?? '0'}</span>
      </div>
      <div class="stat-card">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0-3h8v2h-8zm0 6h4v2h-4z" />
        </svg>
        <span class="stat-card-label">{m.stat_label_shows_watched()}</span>
        <span class="stat-big">{stats?.shows.watched.toLocaleString() ?? '0'}</span>
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

{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
  }

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

  /* The identity row overlaps the cover's bottom edge; without a scrim a
     bright cover swallows the username and the gear icon. */
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

  .has-cover .profile-username,
  .has-cover .profile-name {
    text-shadow: 0 1px 6px var(--color-background);
  }

  .profile-identity {
    display: flex;
    align-items: flex-end;
    gap: var(--gap-m);
    padding: 0 var(--gap-m) var(--gap-m);
    margin-top: var(--trakttime-profile-offset);
  }

  .profile-avatar {
    width: var(--trakttime-avatar-size);
    height: var(--trakttime-avatar-size);
    flex-shrink: 0;
    border-radius: 50%;
    box-shadow: 0 0 0 3px var(--color-background);
  }

  .profile-meta {
    padding-bottom: var(--gap-xs);
    min-width: 0;
  }

  .profile-username-row {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    min-width: 0;
  }

  .profile-username {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .profile-settings-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    color: var(--color-text-secondary);
    flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover,
    &:focus-visible {
      background: color-mix(
        in srgb,
        var(--color-text-primary) 8%,
        transparent
      );
      color: var(--color-text-primary);
    }

    :global(svg) {
      width: 1.125rem;
      height: 1.125rem;
    }
  }

  .has-cover .profile-settings-btn {
    background: color-mix(in srgb, var(--color-background) 55%, transparent);
    backdrop-filter: blur(8px);
    color: var(--color-text-primary);
  }

  .profile-name {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .profile-about {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin: var(--gap-xs) 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .profile-counts {
    display: flex;
    align-items: stretch;
    border-top: var(--ni-1) solid var(--color-border);
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .count-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--gap-m) var(--gap-xs);
    gap: var(--ni-2);
  }

  .count-divider {
    width: var(--ni-1);
    background: var(--color-border);
    margin: var(--gap-s) 0;
  }

  .count-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .count-label {
    font-size: 0.625rem;
    color: var(--color-text-secondary);
    text-transform: lowercase;
    letter-spacing: 0.02em;
  }

  .profile-section {
    padding: var(--gap-m) 0;
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gap-m) var(--gap-s);
    text-decoration: none;
    color: inherit;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }

  .section-title--heart {
    color: var(--trakttime-accent);
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

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-s);
    padding: 0 var(--gap-m);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: var(--gap-m);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-m);
  }

  .stat-icon {
    width: var(--trakttime-icon-md);
    height: var(--trakttime-icon-md);
    color: var(--color-text-secondary);
  }

  .stat-card-label {
    font-size: 0.75rem;
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
      font-size: 1.25rem;
      font-weight: 700;
    }
  }

  .stat-big {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .stat-placeholder {
    color: var(--color-text-secondary);
    opacity: 0.45;
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
    border-radius: var(--border-radius-m);
    border: var(--ni-1) solid var(--color-border);
    text-decoration: none;
    transition: border-color 0.15s ease;

    &:active {
      border-color: var(--trakttime-accent);
    }
  }

  .list-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .list-count {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .list-card-skeleton {
    height: var(--ni-40);
    @include shimmer-bg;
  }

  .lists-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Reserve same footprint as 3 list-card skeletons + their gaps */
    min-height: calc(var(--ni-40) * 3 + var(--gap-xs) * 2);
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
