<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import type { MediaComment } from '$lib/requests/models/MediaComment.ts';

  type Props = {
    gif: NonNullable<MediaComment['gif']>;
    isHidden: boolean;
    hasRevealLabel: boolean;
    onReveal: () => void;
  };

  const { gif, isHidden, hasRevealLabel, onReveal }: Props = $props();

  const aspectRatio = $derived(
    gif.size ? `${gif.size.width} / ${gif.size.height}` : undefined,
  );
</script>

{#if isHidden}
  <button
    type="button"
    class="comment-gif is-hidden"
    style:aspect-ratio={aspectRatio}
    aria-label={m.text_reveal_spoiler()}
    onclick={onReveal}
  >
    <img src={gif.url} alt="" loading="lazy" decoding="async" />
    {#if hasRevealLabel}
      <span class="comment-gif-reveal">{m.text_reveal_spoiler()}</span>
    {/if}
  </button>
{:else}
  <div class="comment-gif" style:aspect-ratio={aspectRatio}>
    <img
      src={gif.url}
      alt={m.image_alt_comment_gif()}
      loading="lazy"
      decoding="async"
    />
  </div>
{/if}

<style lang="scss">
  .comment-gif {
    position: relative;
    display: block;
    width: min(100%, var(--trakttime-comment-gif-width));
    max-height: var(--trakttime-comment-gif-max-height);
    min-height: var(--ni-80);
    padding: 0;
    border: none;
    border-radius: var(--trakttime-radius-card);
    overflow: hidden;
    background: var(--color-card-background);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.is-hidden {
      cursor: pointer;

      img {
        filter: blur(18px);
        transform: scale(1.1);
      }
    }
  }

  .comment-gif-reveal {
    position: absolute;
    inset: auto var(--gap-s) var(--gap-s);
    padding: var(--gap-xs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    text-align: center;
  }
</style>
