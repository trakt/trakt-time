<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    DISCOVER_SEARCH_PARAM,
    toDiscoverSearchUrl,
  } from '$lib/features/search/discoverSearchUrl.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { on } from 'svelte/events';

  let input: HTMLInputElement | undefined = $state();

  const isOnDiscover = $derived(page.url.pathname === '/discover');
  const value = $derived(
    isOnDiscover ? page.url.searchParams.get(DISCOVER_SEARCH_PARAM) ?? '' : '',
  );

  function onInput(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    goto(toDiscoverSearchUrl(term), {
      replaceState: isOnDiscover,
      keepFocus: true,
      noScroll: true,
    });
  }

  function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key !== '/') return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;
    if (!input?.checkVisibility()) return;

    event.preventDefault();
    input.focus();
  }

  $effect(() => on(globalThis.window, 'keydown', onWindowKeydown));
</script>

<form class="side-nav-search" role="search" onsubmit={(e) => e.preventDefault()}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
  <input
    bind:this={input}
    type="search"
    placeholder={m.placeholder_search_media()}
    aria-label={m.button_label_search_media()}
    {value}
    oninput={onInput}
  />
  <kbd aria-hidden="true">/</kbd>
</form>

<style lang="scss">
  .side-nav-search {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    height: var(--ni-40);
    padding: 0 var(--gap-s);
    border-radius: var(--border-radius-m);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
    color: var(--color-text-secondary);
    transition: border-color var(--transition-increment) ease-in-out;

    &:focus-within {
      border-color: var(--trakttime-accent);
    }

    svg {
      width: var(--ni-16);
      height: var(--ni-16);
      flex-shrink: 0;
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      outline: none;
      color: var(--color-text-primary);
      font: inherit;
      font-size: 0.8125rem;

      &::placeholder {
        color: var(--color-text-secondary);
      }

      &::-webkit-search-cancel-button {
        display: none;
      }
    }

    kbd {
      font: inherit;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0 var(--ni-6);
      border-radius: var(--border-radius-xs);
      border: var(--ni-1) solid var(--color-border);
    }

    &:focus-within kbd {
      display: none;
    }
  }
</style>
