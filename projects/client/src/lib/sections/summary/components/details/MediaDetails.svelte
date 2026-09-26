<script lang="ts">
  import type { MediaDetail } from './toMediaDetails.ts';

  const { details }: { details: ReadonlyArray<MediaDetail> } = $props();
</script>

{#if details.length > 0}
  <dl class="media-details">
    {#each details as detail (detail.label)}
      <div class="media-detail">
        <dt>{detail.label}</dt>
        <dd>{detail.value}</dd>
      </div>
    {/each}
  </dl>
{/if}

<style lang="scss">
  .media-details {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 0;
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }

  .media-detail {
    display: flex;
    justify-content: space-between;
    gap: var(--gap-s);
    font-size: 0.8125rem;

    dt {
      color: var(--color-text-secondary);
    }

    dd {
      margin: 0;
      text-align: end;
      color: var(--color-text-primary);
    }
  }
</style>
