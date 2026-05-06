<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useSearch } from '$lib/features/search/useSearch.ts';
  import { useRecommendedList } from '$lib/sections/lists/recommended/useRecommendedList.ts';
  import { useTrendingList } from '$lib/sections/lists/trending/useTrendingList.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';

  const SECTION_LIMIT = 10;

  const { list: showRecommendedList, isLoading: showRecommendedLoading } =
    useRecommendedList({ type: 'show', limit: SECTION_LIMIT, filter: {} });

  const { list: movieRecommendedList, isLoading: movieRecommendedLoading } =
    useRecommendedList({ type: 'movie', limit: SECTION_LIMIT, filter: {} });

  const { list: showTrendingList, isLoading: showTrendingLoading } =
    useTrendingList({ type: 'show', limit: SECTION_LIMIT, filter: {} });

  const { list: movieTrendingList, isLoading: movieTrendingLoading } =
    useTrendingList({ type: 'movie', limit: SECTION_LIMIT, filter: {} });

  const { search, clear, results, isSearching } = useSearch();

  let searchQuery = $state('');

  const isSearchActive = $derived(searchQuery.trim().length > 0);
  const searchResults = $derived($results);
  const searchLoading = $derived($isSearching);

  function onSearchInput(e: Event) {
    const term = (e.target as HTMLInputElement).value;
    searchQuery = term;
    if (term.trim()) {
      search(term, 'media');
    } else {
      clear();
    }
  }

  function clearSearch() {
    searchQuery = '';
    clear();
  }
</script>

<svelte:head>
  <title>{m.page_title_discover()} - Trakt Time</title>
</svelte:head>

<div class="discover-page">
  <div class="search-bar-wrap">
    <form class="search-form" onsubmit={(e) => e.preventDefault()}>
      <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input
        type="search"
        class="search-input"
        placeholder={m.placeholder_search_media()}
        value={searchQuery}
        oninput={onSearchInput}
        aria-label={m.button_label_search_media()}
      />
      {#if searchQuery}
        <button
          class="search-clear"
          type="button"
          onclick={clearSearch}
          aria-label={m.button_label_clear_search()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
            />
          </svg>
        </button>
      {/if}
    </form>
  </div>

  {#if isSearchActive}
    <div class="search-results">
      {#if searchLoading}
        <div class="row-loading"><LoadingIndicator /></div>
      {:else if searchResults && searchResults.type === 'media' && searchResults.items.length > 0}
        <div class="poster-grid" role="list">
          {#each searchResults.items as item (item.key)}
            <PosterCard
              type={item.type}
              href={item.type === 'show'
                ? UrlBuilder.show(item.slug)
                : UrlBuilder.movie(item.slug)}
              id={item.id}
              title={item.title}
              posterUrl={item.poster.url.thumb}
            />
          {/each}
        </div>
      {:else if searchResults != null}
        <div class="empty-search">
          <p>{m.text_no_search_results({ query: `"${searchQuery}"` })}</p>
        </div>
      {/if}
    </div>
  {:else}
    <section class="discover-section">
      <a
        href="/recommended/shows"
        class="section-header"
        aria-label={m.button_label_view_all_section({ section: m.header_top_shows_for_you() })}
      >
        <h2 class="section-title">{m.header_top_shows_for_you()}</h2>
        <span class="chevron"><ChevronRightIcon /></span>
      </a>
      {#if $showRecommendedLoading && $showRecommendedList.length === 0}
        <div class="poster-row" aria-hidden="true">
          {#each Array(SECTION_LIMIT) as _, i (`sr-${i}`)}
            <PosterSkeleton />
          {/each}
        </div>
      {:else}
        <div class="poster-row" role="list">
          {#each $showRecommendedList as item (item.id)}
            <PosterCard
              type="show"
              href={UrlBuilder.show(item.slug)}
              id={item.id}
              title={item.title}
              posterUrl={item.poster.url.thumb}
            />
          {/each}
        </div>
      {/if}
    </section>

    <section class="discover-section">
      <a
        href="/trending/shows"
        class="section-header"
        aria-label={m.button_label_view_all_section({ section: m.header_trending_shows() })}
      >
        <h2 class="section-title">{m.header_trending_shows()}</h2>
        <span class="chevron"><ChevronRightIcon /></span>
      </a>
      {#if $showTrendingLoading && $showTrendingList.length === 0}
        <div class="poster-row" aria-hidden="true">
          {#each Array(SECTION_LIMIT) as _, i (`st-${i}`)}
            <PosterSkeleton />
          {/each}
        </div>
      {:else}
        <div class="poster-row" role="list">
          {#each $showTrendingList as item (item.id)}
            <PosterCard
              type="show"
              href={UrlBuilder.show(item.slug)}
              id={item.id}
              title={item.title}
              posterUrl={item.poster.url.thumb}
            />
          {/each}
        </div>
      {/if}
    </section>

    <a href="/popular/shows" class="browse-cta">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"
        />
      </svg>
      {m.button_text_browse_all_shows()}
      <span class="cta-chevron"><ChevronRightIcon /></span>
    </a>

    <section class="discover-section">
      <a
        href="/recommended/movies"
        class="section-header"
        aria-label={m.button_label_view_all_section({ section: m.header_top_movies_for_you() })}
      >
        <h2 class="section-title">{m.header_top_movies_for_you()}</h2>
        <span class="chevron"><ChevronRightIcon /></span>
      </a>
      {#if $movieRecommendedLoading && $movieRecommendedList.length === 0}
        <div class="poster-row" aria-hidden="true">
          {#each Array(SECTION_LIMIT) as _, i (`mr-${i}`)}
            <PosterSkeleton />
          {/each}
        </div>
      {:else}
        <div class="poster-row" role="list">
          {#each $movieRecommendedList as item (item.id)}
            <PosterCard
              type="movie"
              href={UrlBuilder.movie(item.slug)}
              id={item.id}
              title={item.title}
              posterUrl={item.poster.url.thumb}
            />
          {/each}
        </div>
      {/if}
    </section>

    <section class="discover-section">
      <a
        href="/trending/movies"
        class="section-header"
        aria-label={m.button_label_view_all_section({ section: m.header_trending_movies() })}
      >
        <h2 class="section-title">{m.header_trending_movies()}</h2>
        <span class="chevron"><ChevronRightIcon /></span>
      </a>
      {#if $movieTrendingLoading && $movieTrendingList.length === 0}
        <div class="poster-row" aria-hidden="true">
          {#each Array(SECTION_LIMIT) as _, i (`mt-${i}`)}
            <PosterSkeleton />
          {/each}
        </div>
      {:else}
        <div class="poster-row" role="list">
          {#each $movieTrendingList as item (item.id)}
            <PosterCard
              type="movie"
              href={UrlBuilder.movie(item.slug)}
              id={item.id}
              title={item.title}
              posterUrl={item.poster.url.thumb}
            />
          {/each}
        </div>
      {/if}
    </section>

    <a href="/popular/movies" class="browse-cta">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"
        />
      </svg>
      {m.button_text_browse_all_movies()}
      <span class="cta-chevron"><ChevronRightIcon /></span>
    </a>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .discover-page {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .search-bar-wrap {
    position: sticky;
    top: 0;
    z-index: var(--layer-floating);
    padding: var(--gap-s) var(--gap-m);
    background: var(--trakttime-navbar-blur-bg);
    backdrop-filter: blur(12px);
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .search-form {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--border-radius-xxl);
    padding: var(--gap-xs) var(--gap-m);
  }

  .search-icon {
    width: var(--trakttime-icon-sm);
    height: var(--trakttime-icon-sm);
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 0.9375rem;
    color: var(--color-text-primary);
    font-family: inherit;

    &::placeholder {
      color: var(--color-text-secondary);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  .search-clear {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;

    svg {
      width: var(--trakttime-icon-sm);
      height: var(--trakttime-icon-sm);
    }
  }

  .search-results {
    flex: 1;
    padding: var(--gap-m);
  }

  .poster-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(var(--trakttime-poster-card-width), 1fr)
    );
    gap: var(--gap-s);
  }

  .empty-search {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-m);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-align: center;
  }


  .row-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-l) var(--gap-m);
  }

  .discover-section {
    padding: var(--gap-m) 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gap-m) var(--gap-s);
    text-decoration: none;
    color: inherit;

    &:hover .section-title {
      color: var(--trakttime-accent);
    }
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    transition: color var(--transition-increment) ease-in-out;
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

  .poster-row {
    @include scrollable-row;
    padding: 0 var(--gap-m);
  }

  .browse-cta {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    margin: 0 var(--gap-m) var(--gap-m);
    padding: var(--gap-m);
    background: var(--trakttime-accent);
    color: var(--color-background);
    border-radius: var(--border-radius-m);
    text-decoration: none;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.06em;

    svg {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      flex-shrink: 0;
    }

    .cta-chevron {
      margin-left: auto;
    }
  }
</style>
