<script lang="ts">
  type CompareHeaderProps = { title: string; intro: string };

  const { title, intro }: CompareHeaderProps = $props();
</script>

<header class="compare-header">
  <h1 class="compare-title">{title}</h1>
  <p class="compare-intro">{intro}</p>
</header>

<style lang="scss">
  .compare-header {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .compare-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.1;
    text-wrap: balance;
  }

  .compare-intro {
    max-width: 38rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
</style>
