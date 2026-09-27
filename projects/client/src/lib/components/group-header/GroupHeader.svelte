<script lang="ts">
  import type { Snippet } from 'svelte';

  const { label, trailing }: { label: string; trailing?: Snippet } = $props();
</script>

<div class="group-header">
  <h2 class="group-header-title">{label}</h2>
  {@render trailing?.()}
</div>

<style lang="scss">
  .group-header {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-m) var(--trakttime-page-gutter) var(--gap-s);
  }
</style>
