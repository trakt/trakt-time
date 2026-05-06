<script lang="ts">
  const { label }: { label: string } = $props();
</script>

<div class="group-header">
  <span class="group-header-pill">{label}</span>
</div>

<style lang="scss">
  .group-header {
    display: flex;
    justify-content: center;
    padding: var(--gap-s) 0;
  }
</style>
