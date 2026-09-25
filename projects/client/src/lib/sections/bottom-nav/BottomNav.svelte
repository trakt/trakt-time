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
    bottom: calc(var(--gap-s) + env(safe-area-inset-bottom, var(--ni-0)));
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2 * var(--gap-m));
    max-width: calc(var(--trakttime-max-width) - 2 * var(--gap-m));
    z-index: var(--layer-overlay);
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    gap: var(--ni-4);
    height: var(--trakttime-bottom-nav-height);
    padding: var(--ni-4);
    background-color: var(--trakttime-navbar-blur-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--color-border) 60%, transparent);
    border-radius: var(--trakttime-radius-pill);

    .bottom-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      flex: 1;
      color: var(--color-text-secondary);
      text-decoration: none;
      border-radius: var(--trakttime-radius-pill);
      transition:
        color var(--transition-increment) ease-in-out,
        background-color var(--transition-increment) ease-in-out;

      &[data-active='true'] {
        color: var(--trakttime-accent);
        background-color: color-mix(
          in srgb,
          var(--color-text-primary) 10%,
          transparent
        );
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
      var(--trakttime-bottom-nav-height) + var(--gap-l) +
        env(safe-area-inset-bottom, 0px)
    );
  }
</style>
