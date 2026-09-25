<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { CommentDraftGif } from './CommentDraftGif.ts';

  type Props = {
    gif: CommentDraftGif;
    onRemove: () => void;
    disabled?: boolean;
  };

  const { gif, onRemove, disabled }: Props = $props();
</script>

<div class="selected-gif" style:aspect-ratio="{gif.width} / {gif.height}">
  <img src={gif.previewUrl} alt="" />
  <button
    type="button"
    class="selected-gif-remove"
    aria-label={m.button_label_remove_gif()}
    {disabled}
    onclick={onRemove}
  >
    <CloseIcon />
  </button>
</div>

<style lang="scss">
  .selected-gif {
    position: relative;
    height: var(--ni-104);
    max-width: 60%;
    border-radius: var(--trakttime-radius-card);
    overflow: hidden;
    background: var(--color-card-background);
    animation: selected-gif-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .selected-gif-remove {
    position: absolute;
    top: var(--gap-xxs);
    right: var(--gap-xxs);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-28);
    height: var(--ni-28);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: color-mix(in srgb, var(--shade-1000) 65%, transparent);
    color: var(--shade-10);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }
  }

  @keyframes selected-gif-pop {
    from {
      transform: scale(0.85);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .selected-gif {
      animation: none;
    }
  }
</style>
