<script lang="ts">
  type Props = {
    coverUrl: string | Nil;
    posters: ReadonlyArray<string>;
  };

  const { coverUrl, posters }: Props = $props();

  const WALL_SIZE = 10;

  let failedCoverUrl = $state<string | null>(null);
  const activeCoverUrl = $derived(coverUrl === failedCoverUrl ? null : coverUrl);

  const wall = $derived(
    posters.length === 0
      ? []
      : Array.from({ length: WALL_SIZE }, (_, i) => posters[i % posters.length]!),
  );
</script>

<div class="poster-wall" aria-hidden="true">
  {#if activeCoverUrl}
    <img
      class="poster-wall-cover"
      src={activeCoverUrl}
      alt=""
      onerror={() => (failedCoverUrl = activeCoverUrl)}
    />
  {:else if wall.length > 0}
    <div class="poster-wall-grid">
      {#each wall as poster, i (i)}
        <img src={poster} alt="" loading="lazy" />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .poster-wall {
    position: relative;
    height: var(--trakttime-profile-cover-height);
    overflow: hidden;
    background:
      radial-gradient(
        120% 90% at 80% 0%,
        color-mix(in srgb, var(--rose-500) 35%, transparent) 0%,
        color-mix(in srgb, var(--purple-500) 30%, transparent) 45%,
        transparent 80%
      ),
      var(--color-card-background);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--color-background) 25%, transparent) 0%,
        color-mix(in srgb, var(--color-background) 55%, transparent) 55%,
        var(--color-background) 100%
      );
    }
  }

  .poster-wall-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .poster-wall-grid {
    position: absolute;
    inset: calc(var(--ni-32) * -1);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--gap-xs);
    transform: rotate(-8deg) scale(1.25);

    img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--border-radius-m);
      background: var(--color-floating-background);
    }
  }
</style>
