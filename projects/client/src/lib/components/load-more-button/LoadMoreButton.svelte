<script lang="ts">
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';

  type Props = {
    loading: boolean;
    onclick: () => void;
    label: string;
    variant?: 'forward' | 'older';
  };

  const { loading, onclick, label, variant = 'forward' }: Props = $props();
</script>

<button class="load-button" data-variant={variant} {onclick} disabled={loading}>
  {#if loading}
    <LoadingIndicator />
  {:else if variant === 'older'}
    ↑ {label}
  {:else}
    {label}
  {/if}
</button>

<style lang="scss">
  .load-button {
    width: 100%;
    padding: var(--gap-m);
    background: none;
    border: none;
    color: var(--trakttime-accent);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &[data-variant='older'] {
      opacity: 0.7;
    }
  }
</style>
