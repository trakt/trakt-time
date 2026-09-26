<script lang="ts">
  import type { Snippet } from 'svelte';
  import MediaDetails from '../details/MediaDetails.svelte';
  import type { MediaDetail } from '../details/toMediaDetails.ts';

  type SummaryAsideProps = {
    posterUrl: string;
    details: ReadonlyArray<MediaDetail>;
    children: Snippet;
  };

  const { posterUrl, details, children }: SummaryAsideProps = $props();
</script>

<aside class="summary-aside">
  <img class="summary-aside-poster" src={posterUrl} alt="" loading="lazy" />
  {@render children()}
  <div class="summary-aside-details">
    <MediaDetails {details} />
  </div>
</aside>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .summary-aside {
    display: contents;

    @include for-desktop {
      display: flex;
      flex-direction: column;
      gap: var(--gap-m);
    }
  }

  .summary-aside-poster,
  .summary-aside-details {
    display: none;

    @include for-desktop {
      display: block;
    }
  }

  .summary-aside-poster {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: var(--border-radius-l);
    background: var(--color-card-background);
    box-shadow:
      0 var(--ni-24) var(--ni-60)
        color-mix(in srgb, var(--shade-1000) 60%, transparent),
      0 0 0 var(--ni-1) color-mix(in srgb, var(--shade-10) 6%, transparent);
  }
</style>
