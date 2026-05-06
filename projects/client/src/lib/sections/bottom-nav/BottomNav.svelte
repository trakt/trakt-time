<script lang="ts">
  import { page } from '$app/state';
  import DiscoverIcon from '$lib/components/icons/DiscoverIcon.svelte';
  import MovieIcon from '$lib/components/icons/MovieIcon.svelte';
  import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
  import ShowIcon from '$lib/components/icons/ShowIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';

  const tabs = $derived([
    { href: '/shows', label: m.page_title_shows(), icon: ShowIcon },
    { href: '/movies', label: m.page_title_movies(), icon: MovieIcon },
    { href: '/discover', label: m.page_title_discover(), icon: DiscoverIcon },
    { href: '/profile', label: m.page_title_profile(), icon: ProfileIcon },
  ] as const);

  const pathname = $derived(page.url.pathname);
  const isActive = $derived((href: string) => pathname.startsWith(href));
</script>

<nav class="bottom-nav" aria-label={m.button_label_main_navigation()}>
  {#each tabs as { href, label, icon: Icon }}
    <a {href} aria-label={label} class="bottom-nav-tab" data-active={isActive(href)}>
      <Icon />
      <span class="tab-label">{label}</span>
    </a>
  {/each}
</nav>

<!-- Spacer prevents content from hiding behind fixed nav -->
<div class="bottom-nav-spacer" aria-hidden="true"></div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: var(--trakttime-max-width);
    z-index: var(--layer-overlay);
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    height: var(--trakttime-bottom-nav-height);
    padding-bottom: env(safe-area-inset-bottom, var(--ni-0));
    background-color: var(--trakttime-navbar-blur-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: var(--ni-1) solid var(--color-border);

    .bottom-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      flex: 1;
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: var(--gap-xs) 0;
      transition: color var(--transition-increment) ease-in-out;

      &[data-active='true'] {
        color: var(--trakttime-accent);
      }
    }
  }

  .tab-label {
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .bottom-nav-spacer {
    height: calc(
      var(--trakttime-bottom-nav-height) + env(safe-area-inset-bottom, 0px)
    );
  }
</style>
