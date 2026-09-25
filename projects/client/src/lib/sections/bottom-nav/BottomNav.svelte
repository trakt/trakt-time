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
  const activeIndex = $derived(tabs.findIndex(({ href }) => isActive(href)));
</script>

<nav
  class="bottom-nav"
  aria-label={m.button_label_main_navigation()}
  style:--tab-count={tabs.length}
  style:--active-index={Math.max(activeIndex, 0)}
>
  <span
    class="bottom-nav-indicator"
    class:is-hidden={activeIndex === -1}
    aria-hidden="true"
  ></span>
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
    --nav-padding: var(--ni-4);

    height: var(--trakttime-bottom-nav-height);
    padding: var(--nav-padding);
    box-sizing: border-box;
    background-color: var(--trakttime-navbar-solid-bg);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    box-shadow: 0 var(--ni-8) var(--ni-32)
      color-mix(in srgb, var(--shade-1000) 35%, transparent);

    .bottom-nav-indicator {
      position: absolute;
      inset-block: var(--nav-padding);
      inset-inline-start: var(--nav-padding);
      width: calc((100% - 2 * var(--nav-padding)) / var(--tab-count));
      border-radius: var(--trakttime-radius-pill);
      background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--rose-500) 7%, transparent),
        color-mix(in srgb, var(--purple-500) 13%, transparent)
      );
      box-shadow: inset 0 0 0 var(--ni-1)
        color-mix(in srgb, var(--purple-500) 16%, transparent);
      transform: translateX(calc(var(--active-index) * 100%));
      transition:
        transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity var(--transition-increment) ease-in-out;
      pointer-events: none;

      &.is-hidden {
        opacity: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }

    .bottom-nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      flex: 1;
      position: relative;
      color: var(--color-text-secondary);
      text-decoration: none;
      border-radius: var(--trakttime-radius-pill);
      -webkit-tap-highlight-color: transparent;
      transition: color var(--transition-increment) ease-in-out;

      &:focus-visible {
        outline: var(--border-thickness-xs) solid var(--trakttime-accent);
        outline-offset: calc(-1 * var(--border-thickness-xs));
      }

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
      var(--trakttime-bottom-nav-height) + var(--gap-l) +
        env(safe-area-inset-bottom, 0px)
    );
  }
</style>
