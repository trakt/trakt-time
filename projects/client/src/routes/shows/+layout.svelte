<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';

  const { children }: ChildrenProps = $props();

  const activeTab = $derived(
    page.url.pathname.includes('upcoming') ? 'upcoming' : 'watchlist',
  );
</script>

<div class="shows-layout">
  <nav class="tab-bar" aria-label={m.button_label_shows_navigation()}>
    <a
      href="/shows/watchlist"
      class="tab-link"
      aria-current={activeTab === 'watchlist' ? 'page' : undefined}
      data-active={activeTab === 'watchlist'}
    >
      {m.tab_label_watch_list()}
    </a>
    <a
      href="/shows/upcoming"
      class="tab-link"
      aria-current={activeTab === 'upcoming' ? 'page' : undefined}
      data-active={activeTab === 'upcoming'}
    >
      {m.tab_label_upcoming()}
    </a>
  </nav>

  <div class="tab-content">
    {@render children()}
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .shows-layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .tab-bar {
    position: sticky;
    top: 0;
    z-index: var(--layer-floating);
    display: flex;
    background-color: var(--trakttime-navbar-blur-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: var(--ni-1) solid var(--color-border);
  }

  .tab-link {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gap-s) 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-bottom: var(--ni-2) solid transparent;
    transition:
      color var(--transition-increment) ease-in-out,
      border-color var(--transition-increment) ease-in-out;

    &[data-active='true'] {
      color: var(--trakttime-accent);
      border-bottom-color: var(--trakttime-accent);
    }
  }

  .tab-content {
    flex: 1;
  }
</style>
