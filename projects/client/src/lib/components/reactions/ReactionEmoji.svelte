<script lang="ts">
  import { toReactionEmojiUrl } from './toReactionEmojiUrl.ts';

  const { code, label }: { code: string; label: string } = $props();
</script>

<img
  class="reaction-emoji"
  src={toReactionEmojiUrl(code)}
  alt={label}
  draggable="false"
  decoding="async"
/>

<style lang="scss">
  .reaction-emoji {
    display: block;
    flex-shrink: 0;
    width: var(--reaction-emoji-size, var(--ni-20));
    height: var(--reaction-emoji-size, var(--ni-20));
    object-fit: contain;
    user-select: none;
  }
</style>
