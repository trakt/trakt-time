<script lang="ts">
  const {
    title,
    description,
    children,
  }: ChildrenProps & { title: string; description: string } = $props();
</script>

<div class="trakt-settings-block">
  <div class="trakt-settings-block-header">
    <h2 class="settings-title">{title}</h2>
    <p class="secondary">{description}</p>
  </div>
  <div class="trakt-settings-block-content">
    {@render children()}
  </div>
</div>

<style lang="scss">
  @use "$style/scss/mixins/index" as *;

  .trakt-settings-block-header {
    display: flex;
    flex-direction: column;

    gap: var(--gap-xs);

    .settings-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }

  .trakt-settings-block,
  .trakt-settings-block-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .trakt-settings-block-content {
    padding: var(--gap-m);
    background: var(--color-card-background);
    border-radius: var(--trakttime-radius-card);
  }
</style>
