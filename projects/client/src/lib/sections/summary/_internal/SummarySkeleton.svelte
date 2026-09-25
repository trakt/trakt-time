<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant: 'show' | 'movie' | 'episode';
    children?: Snippet;
  };

  const { variant, children }: Props = $props();
</script>

<div class="summary-skeleton" aria-hidden="true">
  <div class="summary-skeleton-cover"></div>

  <div class="summary-content">
    <div class="summary-header">
      <div class="summary-info">
        {#if variant === 'episode'}
          <div class="summary-skeleton-line summary-skeleton-line--show"></div>
          <div class="summary-skeleton-line summary-skeleton-line--code"></div>
        {/if}
        <div class="summary-skeleton-line summary-skeleton-line--title"></div>
        <div class="summary-skeleton-line summary-skeleton-line--meta"></div>
        {#if variant === 'show'}
          <div class="summary-skeleton-line summary-skeleton-line--badge"></div>
        {/if}
        <div class="summary-skeleton-line summary-skeleton-line--rating"></div>
      </div>
    </div>

    <div class="summary-skeleton-line summary-skeleton-line--actions"></div>

    {#if variant !== 'episode'}
      <div class="summary-skeleton-genres">
        {#each Array(3) as _, i (`g-${i}`)}
          <div class="summary-skeleton-chip" style:animation-delay="{i * 0.05}s"></div>
        {/each}
      </div>

      <div class="summary-skeleton-line summary-skeleton-line--tagline"></div>
    {/if}

    <div class="summary-skeleton-overview">
      {#each Array(5) as _, i (`o-${i}`)}
        <div
          class="summary-skeleton-line summary-skeleton-line--overview"
          class:is-short={i === 4}
          style:animation-delay="{i * 0.05}s"
        ></div>
      {/each}
    </div>

    {@render children?.()}
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors the summary shell (.summary-cover-hero + header + overview) so
     the settled page lands on the exact same footprint. */
  .summary-skeleton {
    display: flex;
    flex-direction: column;
  }

  .summary-skeleton-cover {
    height: var(--trakttime-cover-height);
    flex-shrink: 0;
    @include shimmer-bg;
  }

  .summary-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    /* Heights track the rendered line boxes of the real summary text. */
    &--title {
      width: 70%;
      height: calc(1.75rem * 1.15);
    }

    &--show {
      width: 35%;
      height: 1.0625rem;
    }

    &--code {
      width: var(--ni-64);
      height: 1rem;
    }

    &--meta {
      width: 55%;
      height: 1.0625rem;
      animation-delay: 0.05s;
    }

    &--badge {
      width: var(--ni-48);
      height: 1.3125rem;
      animation-delay: 0.1s;
    }

    &--rating {
      width: 45%;
      height: 1.0625rem;
      animation-delay: 0.15s;
    }

    &--actions {
      width: 100%;
      height: var(--ni-48);
      border-radius: var(--trakttime-radius-pill);
      animation-delay: 0.2s;
    }

    &--tagline {
      width: 45%;
      /* Line box of .summary-tagline: 0.875rem at line-height 1.5. */
      height: 1.3125rem;
    }

    &--overview {
      width: 100%;
      /* Line box of .summary-overview: 0.9375rem at line-height 1.6. */
      height: 1.5rem;

      &.is-short {
        width: 60%;
      }
    }
  }

  .summary-skeleton-genres {
    display: flex;
    gap: var(--gap-xs);
  }

  .summary-skeleton-chip {
    width: var(--ni-80);
    height: 1.5rem;
    border-radius: var(--border-radius-xxl);
    @include shimmer-bg;
  }

  .summary-skeleton-overview {
    display: flex;
    flex-direction: column;
  }
</style>
