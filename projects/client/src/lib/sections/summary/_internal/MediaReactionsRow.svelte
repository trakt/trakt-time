<script lang="ts">
  import MediaReactionsBadge from '$lib/features/media-reactions/MediaReactionsBadge.svelte';
  import type { MediaReactionsTarget } from '$lib/features/media-reactions/MediaReactionsTarget.ts';

  const { type, slug, id }: MediaReactionsTarget = $props();
</script>

<div class="summary-reactions">
  {#key `${type}:${slug}`}
    <MediaReactionsBadge {type} {slug} {id} />
  {/key}
</div>

<style lang="scss">
  .summary-reactions {
    display: flex;
    align-items: center;
    align-self: flex-start;
    min-height: var(--ni-36);
  }
</style>
