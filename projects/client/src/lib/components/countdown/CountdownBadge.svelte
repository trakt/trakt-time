<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  const { releaseDate }: { releaseDate: Date } = $props();

  const days = $derived(
    Math.ceil((releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
</script>

{#if days > 0}
  <div class="countdown-badge" aria-label="{days} days until release">
    <span class="countdown-days">{days}</span>
    <span class="countdown-label">{m.text_unit_days()}</span>
  </div>
{/if}

<style lang="scss">
  .countdown-badge {
    position: absolute;
    bottom: var(--gap-xs);
    right: var(--gap-xs);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  }

  .countdown-days {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--trakttime-overlay-text-primary);
    line-height: 1;
    text-shadow: 0 var(--ni-1) var(--ni-4) rgba(0, 0, 0, 0.6);
  }

  .countdown-label {
    font-size: 0.5625rem;
    font-weight: 700;
    color: var(--trakttime-overlay-text-secondary);
    letter-spacing: 0.1em;
    text-shadow: 0 var(--ni-1) var(--ni-4) rgba(0, 0, 0, 0.6);
  }
</style>
