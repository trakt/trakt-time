<script lang="ts">
  import type { MediaTrivia } from '$lib/requests/models/MediaTrivia.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { Marked } from 'marked';

  const {
    trivia,
  }: { trivia: Pick<MediaTrivia, 'text' | 'isSpoiler'> } = $props();

  const marked = new Marked();

  let spoilerRevealed = $state(false);
</script>

<div class="trivia-card">
  {#if trivia.isSpoiler && !spoilerRevealed}
    <button class="spoiler-btn" onclick={() => (spoilerRevealed = true)}>
      {m.text_reveal_spoiler()}
    </button>
  {:else}
    <div class="trivia-card-text">
      {@html marked.parse(trivia.text)}
    </div>
  {/if}
</div>

<style lang="scss">
  .trivia-card {
    padding: var(--gap-m);
    border-radius: var(--border-radius-m);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);
  }

  .trivia-card-text {
    line-height: 1.5;
    color: var(--color-text-primary);

    :global(p) {
      margin: 0;
    }
  }

  .spoiler-btn {
    background: none;
    border: var(--ni-1) dashed var(--color-border);
    border-radius: var(--border-radius-s);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    padding: var(--gap-xs) var(--gap-s);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
</style>
