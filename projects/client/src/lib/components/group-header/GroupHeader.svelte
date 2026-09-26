<script lang="ts">
  const { label }: { label: string } = $props();
</script>

<div class="group-header">
  <h2 class="group-header-title">{label}</h2>
</div>

<style lang="scss">
  .group-header {
    padding: var(--gap-m) var(--trakttime-page-gutter) var(--gap-s);
  }
</style>
