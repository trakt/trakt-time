<script lang="ts">
  import { fade } from 'svelte/transition';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import { provideSectionHeader } from '$lib/sections/lists/upcoming/sectionHeaderContext.svelte.ts';

  const { children }: ChildrenProps = $props();

  const sectionHeader = provideSectionHeader();

  const activeTab = $derived(
    page.url.pathname.includes('upcoming') ? 'upcoming' : 'watchlist',
  );
</script>

<div
  class="shows-layout"
  style:--trakttime-segmented-tabs-height="{sectionHeader.height}px"
>
  <nav
    class="segmented-tabs"
    aria-label={m.button_label_shows_navigation()}
    bind:clientHeight={sectionHeader.height}
  >
    {#key sectionHeader.title}
      <h1 class="segmented-tabs-title" in:fade={{ duration: 150 }}>
        {sectionHeader.title ?? m.page_title_shows()}
      </h1>
    {/key}
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
