<script lang="ts">
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import ClockIcon from '$lib/components/icons/ClockIcon.svelte';
  import FollowIcon from '$lib/components/icons/FollowIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useFollowUser } from './useFollowUser.ts';

  type Props = {
    slug: string;
    username: string;
    size?: 'normal' | 'small';
  };

  const { slug, username, size = 'normal' }: Props = $props();

  const { followStatus, isUpdatingFollow, followUser, unfollowUser, cancelFollowRequest } =
    $derived(useFollowUser({ slug, username }));

  const onclick = () => {
    if ($followStatus === 'following') return unfollowUser();
    if ($followStatus === 'pending') return cancelFollowRequest();
    return followUser();
  };

  const label = $derived.by(() => {
    if ($followStatus === 'following') return m.button_label_unfollow({ username });
    if ($followStatus === 'pending') {
      return m.button_label_cancel_follow_request({ username });
    }
    return m.button_label_follow({ username });
  });
</script>

<button
  type="button"
  class="follow-button"
  data-status={$followStatus}
  data-size={size}
  disabled={$isUpdatingFollow}
  aria-label={label}
  {onclick}
>
  {#if $followStatus === 'following'}
    <CheckIcon />
    {m.button_text_following()}
  {:else if $followStatus === 'pending'}
    <ClockIcon />
    {m.tag_text_follow_request_pending()}
  {:else}
    {#if size === 'normal'}
      <FollowIcon />
    {/if}
    {m.button_text_follow()}
  {/if}
</button>

<style lang="scss">
  .follow-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    height: var(--ni-44);
    padding: 0 var(--gap-m);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-increment) ease-in-out;

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }

    &[data-status='following'],
    &[data-status='pending'] {
      background: var(--color-floating-background);
      color: var(--color-text-primary);
    }

    &[data-status='following'] :global(svg) {
      color: var(--color-text-emphasis);
    }

    &[data-size='small'] {
      height: var(--ni-36);
      padding: 0 var(--gap-s);
      font-size: 0.8125rem;

      :global(svg) {
        width: var(--ni-16);
        height: var(--ni-16);
      }
    }

    &:active {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.6;
      cursor: progress;
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }
</style>
