<script lang="ts">
  type Props = {
    coverUrl: string | null;
    tint?: Nil | string;
  };

  const { coverUrl, tint }: Props = $props();
</script>

{#if coverUrl}
  <div
    class="summary-cover-hero"
    style:--cover-url="url({coverUrl})"
    style:--cover-tint={tint ?? 'var(--color-background)'}
  >
    <div class="summary-cover-gradient"></div>
  </div>
{:else}
  <div class="summary-cover-placeholder"></div>
{/if}

<style lang="scss">
  .summary-cover-hero {
    position: relative;
    height: var(--trakttime-cover-height);
    background-image: var(--cover-url);
    background-size: cover;
    background-position: center top;
    flex-shrink: 0;
  }

  .summary-cover-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 35%,
      color-mix(in srgb, var(--cover-tint) 22%, var(--color-background) 58%) 74%,
      var(--color-background) 100%
    );
  }

  .summary-cover-placeholder {
    height: var(--trakttime-avatar-size);
    flex-shrink: 0;
  }
</style>
