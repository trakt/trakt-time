<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';

  const { children }: ChildrenProps = $props();

  const activeTab = $derived(
    page.url.pathname.includes('upcoming') ? 'upcoming' : 'watchlist',
  );
</script>

<div class="shows-layout">
  <nav class="segmented-tabs" aria-label={m.button_label_shows_navigation()}>
    <h1 class="segmented-tabs-title">{m.page_title_shows()}</h1>
    <div class="segmented-tabs-list">
      <a
        href="/shows/watchlist"
        class="segmented-tab"
        aria-current={activeTab === 'watchlist' ? 'page' : undefined}
        data-active={activeTab === 'watchlist'}
      >
        {m.tab_label_watch_list()}
      </a>
      <a
        href="/shows/upcoming"
        class="segmented-tab"
        aria-current={activeTab === 'upcoming' ? 'page' : undefined}
        data-active={activeTab === 'upcoming'}
      >
        {m.tab_label_upcoming()}
      </a>
    </div>
  </nav>

  <div class="tab-content">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .shows-layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .tab-content {
    flex: 1;
  }
</style>
