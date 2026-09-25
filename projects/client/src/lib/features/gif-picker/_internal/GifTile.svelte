<script lang="ts">
  import type { GifEntry } from '$lib/requests/models/GifEntry.ts';

  type Props = {
    gif: GifEntry;
    isReducedMotion: boolean;
    onSelect: () => void;
  };

  const { gif, isReducedMotion, onSelect }: Props = $props();

  const source = $derived(isReducedMotion && gif.still ? gif.still : gif.preview);
</script>

<button
  type="button"
  class="gif-tile"
  aria-label={gif.title}
  onclick={onSelect}
  style:aspect-ratio="{gif.preview.width} / {gif.preview.height}"
  style:background-image={gif.blurPreview ? `url(${gif.blurPreview})` : undefined}
>
  <img src={source.url} alt={gif.title} loading="lazy" decoding="async" />
</button>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .gif-tile {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    border-radius: var(--trakttime-radius-card);
    overflow: hidden;
    background-color: var(--color-card-background);
    background-size: cover;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform var(--transition-increment) ease-out;

    @include for-mouse {
      &:hover {
        transform: scale(1.02);
      }
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gif-tile {
      transition: none;
    }
  }
</style>
