<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    href: string;
    posterUrl: string;
    title: string;
    subtitle?: string;
    trailing?: Snippet;
    footer?: Snippet;
  };

  const { href, posterUrl, title, subtitle, trailing, footer }: Props = $props();
</script>

<a class="profile-list-row" {href}>
  <span class="profile-list-poster">
    <CrossOriginImage src={posterUrl} alt="" />
  </span>
  <span class="profile-list-text">
    <span class="profile-list-heading">
      <span class="profile-list-title">{title}</span>
      {#if trailing}{@render trailing()}{/if}
    </span>
    {#if subtitle}
      <span class="profile-list-subtitle">{subtitle}</span>
    {/if}
    {#if footer}{@render footer()}{/if}
  </span>
</a>

<style lang="scss">
  .profile-list-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    color: inherit;
    text-decoration: none;
    transition: background-color var(--transition-increment) ease-in-out;

    &:active {
      background: var(--color-floating-background);
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }
  }

  .profile-list-poster {
    flex-shrink: 0;
    width: var(--ni-40);
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-s);
    overflow: hidden;
    background: var(--color-floating-background);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .profile-list-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    flex: 1;
    min-width: 0;
  }

  .profile-list-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-xs);
  }

  .profile-list-title,
  .profile-list-subtitle {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-list-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .profile-list-subtitle {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }
</style>
