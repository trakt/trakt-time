<ul class="season-list-skeleton" aria-hidden="true">
  {#each Array(5) as _, i (`ss-${i}`)}
    <li class="season-row-skeleton">
      <div class="season-skeleton-line season-skeleton-line--label" style:animation-delay="{i * 0.05}s"></div>
      <div class="season-skeleton-line season-skeleton-line--meta" style:animation-delay="{i * 0.05 + 0.1}s"></div>
      <div class="season-skeleton-chevron"></div>
    </li>
  {/each}
</ul>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors the seasons accordion footprint: label + meta + chevron rows. */
  .season-list-skeleton {
    list-style: none;
    margin: 0;
    padding: 0;
    border-radius: var(--trakttime-radius-card);
    overflow: hidden;
    background: var(--color-card-background);
  }

  .season-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m)
      calc(var(--gap-s) + var(--ni-4) + var(--gap-xs));
    border-bottom: var(--ni-1) solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .season-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg-elevated;

    &--label {
      width: var(--ni-88);
      height: 1.3125rem;
    }

    &--meta {
      width: var(--ni-72);
      height: 1rem;
    }
  }

  .season-skeleton-chevron {
    margin-left: auto;
    width: var(--ni-18);
    height: var(--ni-18);
    border-radius: 50%;
    @include shimmer-bg-elevated;
  }
</style>
