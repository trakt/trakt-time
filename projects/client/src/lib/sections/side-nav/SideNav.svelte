<script lang="ts">
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import { SITE_NAME } from '$lib/features/seo/constants.ts';
  import RenderFor from '$lib/guards/RenderFor.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useMainNavTabs } from '$lib/sections/main-nav/useMainNavTabs.svelte.ts';
  import SideNavAccount from './_internal/SideNavAccount.svelte';
  import SideNavLists from './_internal/SideNavLists.svelte';
  import SideNavSearch from './_internal/SideNavSearch.svelte';

  const nav = useMainNavTabs();
  const { login } = useAuth();
</script>

<aside class="side-nav">
  <a class="side-nav-brand" href="/">
    <img src="/favicon.svg" alt="" />
    {SITE_NAME}
  </a>

  <SideNavSearch />

  <nav class="side-nav-tabs" aria-label={m.button_label_main_navigation()}>
    {#each nav.tabs as { href, label, icon: Icon }, index (href)}
      <a {href} class="side-nav-tab" data-active={index === nav.activeIndex}>
        <Icon />
        {label}
      </a>
    {/each}
  </nav>

  <RenderFor audience="authenticated">
    <SideNavLists />
  </RenderFor>

  <div class="side-nav-footer">
    <RenderFor audience="authenticated">
      <SideNavAccount />
    </RenderFor>
    <RenderFor audience="public">
      <button class="side-nav-sign-in" onclick={login}>
        {m.button_text_sign_in_with_trakt()}
      </button>
    </RenderFor>
  </div>
</aside>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .side-nav {
    display: none;

    @include for-desktop {
      position: fixed;
      top: 0;
      bottom: 0;
      left: max(0px, calc(50% - var(--trakttime-app-max-width) / 2));
      z-index: var(--layer-overlay);
      width: var(--trakttime-sidebar-width);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--gap-l);
      padding: var(--gap-l) var(--gap-s) var(--gap-m);
      background: var(--color-background);
      border-right: var(--ni-1) solid var(--color-border);
    }
  }

  .side-nav-brand {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: 0 var(--gap-xs);
    font-family: var(--trakttime-font-heading);
    font-size: 1.1875rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    text-decoration: none;

    img {
      width: var(--ni-32);
      height: var(--ni-32);
    }
  }

  .side-nav-tabs {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .side-nav-tab {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    height: var(--ni-44);
    padding: 0 var(--gap-s);
    border-radius: var(--border-radius-m);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      color var(--transition-increment) ease-in-out,
      background-color var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--ni-22);
      height: var(--ni-22);
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: calc(-1 * var(--border-thickness-xs));
    }

    &[data-active='true'] {
      color: var(--trakttime-accent);
      background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--rose-500) 7%, transparent),
        color-mix(in srgb, var(--purple-500) 13%, transparent)
      );
      box-shadow: inset 0 0 0 var(--ni-1)
        color-mix(in srgb, var(--purple-500) 16%, transparent);
    }

    @include for-mouse {
      &[data-active='false']:hover {
        color: var(--color-text-primary);
        background: var(--color-card-background);
      }
    }
  }

  .side-nav-footer {
    margin-top: auto;
  }

  .side-nav-sign-in {
    width: 100%;
    height: var(--ni-44);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
