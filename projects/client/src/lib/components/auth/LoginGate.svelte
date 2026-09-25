<script lang="ts">
  import { browser } from '$app/environment';
  import { useTrendingList } from '$lib/sections/lists/trending/useTrendingList.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { login }: { login: () => void } = $props();

  const POSTER_COUNT = 7;
  const CENTER_INDEX = Math.floor(POSTER_COUNT / 2);

  const { list: trending } = useTrendingList({
    type: 'show',
    limit: 10,
    filter: {},
  });

  const posters = $derived($trending.slice(0, POSTER_COUNT));
</script>

{#if browser}
  <div class="login-gate">
    <div class="login-gate-posters" aria-hidden="true">
      {#each posters as item, i (item.id)}
        <img
          class="login-gate-poster"
          src={item.poster.url.thumb}
          alt=""
          style:--offset={i - CENTER_INDEX}
        />
      {/each}
    </div>

    <div class="login-gate-hero">
      <h2 class="login-gate-title">{m.header_sign_in_to_trakt()}</h2>
      <p class="login-gate-message">{m.text_sign_in_pitch()}</p>
      <button class="login-gate-btn" onclick={login}>
        {m.button_text_sign_in_with_trakt()}
      </button>
    </div>

    <p class="login-gate-import">
      {m.header_tv_time_liberator()}
      <a href="/settings">{m.welcome_tvtime_import_cta()}</a>
    </p>

    <a class="login-gate-compare" href="/compare">{m.compare_index_title()}</a>
  </div>
{/if}

<style lang="scss">
  .login-gate {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-xl);
    padding: var(--gap-l) var(--gap-m) var(--gap-xxl);
    min-height: 70dvh;
    text-align: center;
    overflow: hidden;
  }

  .login-gate-posters {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    height: var(--ni-240);
    mask-image: linear-gradient(to bottom, black 55%, transparent 100%);

    &::before {
      content: '';
      position: absolute;
      inset: 10% 5% -20%;
      background: radial-gradient(
        ellipse at center,
        color-mix(in srgb, var(--trakttime-accent) 35%, transparent) 0%,
        transparent 70%
      );
      filter: blur(24px);
    }
  }

  .login-gate-poster {
    --abs-offset: max(var(--offset), -1 * var(--offset));

    position: relative;
    z-index: calc(10 - var(--abs-offset));
    flex-shrink: 0;
    width: var(--ni-104);
    aspect-ratio: 2 / 3;
    margin-inline: calc(-1 * var(--ni-16));
    object-fit: cover;
    border-radius: var(--border-radius-m);
    box-shadow: 0 var(--ni-12) var(--ni-32)
      color-mix(in srgb, var(--shade-1000) 60%, transparent);
    transform: translateY(calc(var(--abs-offset) * var(--ni-12)))
      rotate(calc(var(--offset) * 6deg));
    opacity: calc(1 - var(--abs-offset) * 0.15);
  }

  .login-gate-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-s);
    margin-top: calc(-1 * var(--gap-xl));
  }

  .login-gate-title {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--color-text-primary);
    text-wrap: balance;
  }

  .login-gate-message {
    max-width: var(--ni-320);
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  .login-gate-btn {
    margin-top: var(--gap-m);
    min-width: var(--ni-240);
    height: var(--ni-52);
    padding: 0 var(--gap-xl);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 var(--ni-8) var(--ni-24) calc(-1 * var(--ni-8))
      color-mix(in srgb, var(--trakttime-accent) 70%, transparent);
    transition:
      transform var(--transition-increment) ease-in-out,
      opacity var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-visible {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      opacity: 0.9;
    }
  }

  .login-gate-import {
    font-size: 0.875rem;
    color: var(--color-text-secondary);

    a {
      margin-inline-start: var(--gap-xxs);
      color: var(--trakttime-accent);
      font-weight: 600;
      text-decoration: none;
    }
  }

  .login-gate-compare {
    margin-top: calc(-1 * var(--gap-m));
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-decoration: underline;
  }
</style>
