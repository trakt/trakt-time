<script lang="ts">
  const { title, children }: ChildrenProps & { title: string } = $props();
</script>

<section class="trakt-settings-block">
  <h2 class="trakt-settings-block-title">{title}</h2>
  <div class="trakt-settings-block-content">
    {@render children()}
  </div>
</section>

<style lang="scss">
  .trakt-settings-block {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .trakt-settings-block-title {
    margin: 0 0 0 var(--gap-xs);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .trakt-settings-block-content {
    display: flex;
    flex-direction: column;
    background: var(--color-card-background);
    border-radius: var(--border-radius-xl);
    overflow: hidden;

    > :global(* + *) {
      border-top: var(--ni-1) solid var(--color-border);
    }
  }
</style>
