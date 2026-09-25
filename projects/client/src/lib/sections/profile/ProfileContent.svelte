<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import VipBadge from '$lib/components/badge/VipBadge.svelte';
  import CtaLink from '$lib/components/link/CtaLink.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
  import ShareIcon from '$lib/components/icons/ShareIcon.svelte';
  import SegmentedControl from '$lib/components/segmented-control/SegmentedControl.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import ProfileImage from './_internal/ProfileImage.svelte';
  import ProfileHeaderSkeleton from './_internal/ProfileHeaderSkeleton.svelte';
  import ProfilePosterWall from './_internal/ProfilePosterWall.svelte';
  import ProfileWatchTime from './_internal/ProfileWatchTime.svelte';
  import ListPosterStack from './_internal/ListPosterStack.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { userProfileQuery } from '$lib/requests/queries/users/userProfileQuery.ts';
  import { userStatsQuery } from '$lib/requests/queries/users/userStatsQuery.ts';
  import { userListsQuery } from '$lib/requests/queries/users/userListsQuery.ts';
  import { personalListsQuery } from '$lib/requests/queries/users/personalListsQuery.ts';
  import { useFavoritesList } from '$lib/sections/lists/stores/useFavoritesList.ts';
  import { useWatchList } from '$lib/sections/lists/watchlist/useWatchList.ts';
  import { toHumanMonthYear } from '$lib/utils/formatting/date/toHumanMonthYear.ts';
  import { useShareLink } from '$lib/utils/share/useShareLink.svelte.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';

  type Props = {
    slug: string;
    isOwner: boolean;
  };

  type ShelfType = 'show' | 'movie';

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
  const listOwnerId = $derived(isOwner ? 'me' : slug);

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

  const toShelfType = (value: string | null): ShelfType =>
    value === 'movie' ? 'movie' : 'show';

  const favoritesType = $derived(
    toShelfType(page.url.searchParams.get('favorites')),
  );
  const watchlistType = $derived(
    toShelfType(page.url.searchParams.get('watchlist')),
  );

  function setShelfType(shelf: 'favorites' | 'watchlist', type: ShelfType) {
    const url = new URL(page.url);
    url.searchParams.set(shelf, type);
    goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  const shelfOptions = [
    { value: 'show' as const, label: m.page_title_shows() },
    { value: 'movie' as const, label: m.page_title_movies() },
  ];

  const interleave = <T,>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) =>
    Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]])
      .flat()
      .filter((item): item is T => item != null);

  const favoritePosters = $derived(
    interleave(
      $favoriteShows.map((item) => item.item.poster.url.thumb),
      $favoriteMovies.map((item) => item.item.poster.url.thumb),
    ),
  );
  const watchlistPosters = $derived(
    interleave(
      $watchlistShows.map((item) => item.entry.poster.url.thumb),
      $watchlistMovies.map((item) => item.entry.poster.url.thumb),
    ),
  );
  const wallPosters = $derived(
    favoritePosters.length > 0 ? favoritePosters : watchlistPosters,
  );

  const ratingsCount = $derived(
    stats
      ? stats.shows.ratings + stats.movies.ratings + stats.episodes.ratings
      : undefined,
  );

  const joinedText = $derived(
    profile?.joinedAt
      ? m.text_joined({ date: toHumanMonthYear(profile.joinedAt, getLocale()) })
      : '',
  );

  const shareLink = useShareLink();
  const shareProfile = () =>
    shareLink.share({
      url: new URL(UrlBuilder.profile.user(slug), page.url.origin).href,
      title: profile?.name?.full || profile?.username || slug,
    });

  const listsHref = $derived(
    isOwner ? '/profile/me/lists' : `/profile/${slug}/lists`,
  );

  const watchlistHref = $derived.by(() => {
    if (!isOwner) return null;
    return watchlistType === 'show' ? '/shows/watchlist' : '/movies/watchlist';
  });

  const watchlistLabel = $derived(
    watchlistType === 'show'
      ? m.button_label_view_all_watchlisted_shows()
      : m.button_label_view_all_watchlisted_movies(),
  );
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

{#snippet sectionHeader(title: string, href: string | null, label: string)}
  <div class="section-header">
    <h2 class="section-title">{title}</h2>
    {#if href}
      <a {href} class="section-link" aria-label={label}>
        {m.text_see_all()}
        <ChevronRightIcon />
      </a>
    {/if}
  </div>
{/snippet}

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

{#if !profile}
  <ProfileHeaderSkeleton />
{:else}
  <div class="profile-header">
    <ProfilePosterWall coverUrl={profile.cover?.url} posters={wallPosters} />
    <div class="profile-identity">
      <div class="profile-avatar" class:is-vip={profile.isVip}>
        <ProfileImage
          name={profile.username}
          src={profile.avatar.url}
          isEditable={isOwner}
        />
      </div>
      <div class="profile-name-row">
        <h1 class="profile-username">{profile.name?.full || profile.username}</h1>
        {#if profile.isVip}
          <VipBadge isDirector={profile.isDirector} />
        {/if}
      </div>
      <p class="profile-handle">
        {[`@${profile.username}`, profile.location].filter(Boolean).join(' · ')}
      </p>
      <p class="profile-about">{profile.about ?? ''}</p>
      <p class="profile-joined">{joinedText}</p>
    </div>
  </div>
{/if}

<div class="profile-counts">
  {@render countCell(stats?.network.following, m.text_count_following())}
  {@render countCell(stats?.network.followers, m.text_count_followers())}
  {@render countCell(ratingsCount, m.text_count_ratings())}
</div>

<div class="profile-actions" class:has-settings={isOwner}>
  {#if isOwner}
    <a
      href="/settings"
      class="profile-pill profile-pill--primary"
      data-sveltekit-preload-data="hover"
    >
      <SettingsIcon />
      {m.page_title_settings()}
    </a>
  {/if}
  <button type="button" class="profile-pill" onclick={shareProfile}>
    <ShareIcon />
    {shareLink.isCopied ? m.text_link_copied() : m.button_text_share()}
  </button>
</div>

<section class="profile-section">
  {@render sectionHeader(m.header_time_watched(), null, '')}
  <ProfileWatchTime {stats} />
</section>

<section class="profile-section">
  {@render sectionHeader(m.header_favorites(), null, '')}
  <div class="shelf-toggle">
    <SegmentedControl
      label={m.header_favorites()}
      value={favoritesType}
      options={shelfOptions}
      onChange={(type) => setShelfType('favorites', type)}
    />
  </div>
  {#if favoritesType === 'show'}
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
  {:else if $favoriteMoviesLoading && $favoriteMovies.length === 0}
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

<section class="profile-section">
  {@render sectionHeader(m.header_watchlist(), watchlistHref, watchlistLabel)}
  <div class="shelf-toggle">
    <SegmentedControl
      label={m.header_watchlist()}
      value={watchlistType}
      options={shelfOptions}
      onChange={(type) => setShelfType('watchlist', type)}
    />
  </div>
  {#if watchlistType === 'show'}
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
  {:else if $watchlistMoviesLoading && $watchlistMovies.length === 0}
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
  {@render sectionHeader(
    isOwner ? m.header_my_lists() : m.page_title_lists(),
    lists.length > LISTS_PREVIEW_COUNT ? listsHref : null,
    m.button_label_view_all_lists(),
  )}
  {#if listsLoading && lists.length === 0}
    <div class="lists-card" aria-hidden="true">
      {#each Array(3) as _, i (`l-${i}`)}
        <div class="list-row list-row-skeleton"></div>
      {/each}
    </div>
  {:else if lists.length === 0}
    <div class="lists-empty">
      <p>{m.text_no_lists()}</p>
    </div>
  {:else}
    <div class="lists-card">
      {#each lists.slice(0, LISTS_PREVIEW_COUNT) as list (list.id)}
        <a
          href="/lists/{list.id}?name={encodeURIComponent(list.name)}"
          class="list-row"
        >
          <ListPosterStack userId={listOwnerId} listId={list.id} />
          <span class="list-text">
            <span class="list-name">{list.name}</span>
            <span class="list-count">{list.count} {m.text_items_unit()}</span>
          </span>
          <span class="list-chevron"><ChevronRightIcon /></span>
        </a>
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

  .profile-identity {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 var(--gap-m) var(--gap-m);
    margin-top: var(--trakttime-profile-offset);
    position: relative;
    text-align: center;
  }

  .profile-avatar {
    flex-shrink: 0;
    padding: var(--ni-4);
    border-radius: 50%;
    background: var(--color-background);

    &.is-vip {
      background: var(--trakttime-gradient);

      > :global(*) {
        border-radius: 50%;
        box-shadow: 0 0 0 var(--ni-2) var(--color-background);
      }
    }
  }

  .profile-name-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    max-width: 100%;
    margin-top: var(--gap-m);
  }

  .profile-username {
    font-family: var(--trakttime-font-heading);
    font-size: 1.625rem;
    font-weight: 700;
    line-height: 1.15;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-handle {
    margin: var(--ni-4) 0 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .profile-about,
  .profile-joined {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .profile-about {
    height: 1.25rem;
    margin: var(--gap-xs) 0 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--color-text-primary);
  }

  .profile-joined {
    height: 1rem;
    margin: var(--ni-4) 0 0;
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--color-text-secondary);
  }

  .profile-counts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0 var(--gap-m);
    padding: var(--gap-s) 0;
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
  }

  .count-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ni-2);
    min-width: 0;

    & + & {
      border-inline-start: var(--ni-1) solid var(--color-border);
    }
  }

  .count-value {
    font-family: var(--trakttime-font-heading);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
  }

  .count-value--skeleton {
    width: var(--ni-40);
    height: 1.4rem;
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;
  }

  .count-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-transform: capitalize;
  }

  .profile-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap-xs);
    margin: var(--gap-s) var(--gap-m) 0;

    &.has-settings {
      grid-template-columns: 1fr 1fr;
    }
  }

  .profile-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    height: var(--ni-44);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &--primary {
      background: var(--color-text-primary);
      color: var(--color-background);
    }

    &:active {
      opacity: 0.8;
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .profile-section {
    padding-top: var(--gap-xl);
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap-s);
    padding: 0 var(--gap-m) var(--gap-s);
  }

  .section-title {
    font-family: var(--trakttime-font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .section-link {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    text-decoration: none;

    :global(svg) {
      width: var(--trakttime-icon-sm);
      height: var(--trakttime-icon-sm);
    }
  }

  .shelf-toggle {
    padding: 0 var(--gap-m) var(--gap-s);
  }

  .lists-card {
    display: flex;
    flex-direction: column;
    margin: 0 var(--gap-m);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
    overflow: hidden;
  }

  .list-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m);
    text-decoration: none;
    transition: background-color var(--transition-increment) ease-in-out;

    & + & {
      border-top: var(--ni-1) solid var(--color-border);
    }

    &:active {
      background: var(--color-floating-background);
    }
  }

  .list-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    flex: 1;
    min-width: 0;
  }

  .list-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .list-count {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .list-chevron {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
    }
  }

  .list-row-skeleton {
    height: calc(var(--ni-48) + var(--gap-s) * 2);
    @include shimmer-bg;
  }

  .lists-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc((var(--ni-48) + var(--gap-s) * 2) * 3);
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
