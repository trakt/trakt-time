<script lang="ts">
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import CommentsPanel from './CommentsPanel.svelte';
  import { type MediaCommentsProps, useMediaComments } from './useMediaComments.ts';

  const props: MediaCommentsProps = $props();

  let isPanelOpen = $state(false);
  $effect(() => {
    props.mediaId;
    isPanelOpen = false;
  });

  const commentsResult = $derived(useMediaComments(props));

  const commentList = $derived(commentsResult.list);
  const itemCount = $derived(commentsResult.itemCount);
  const isLoading = $derived(commentsResult.isLoading);

  const count = $derived($itemCount ?? $commentList.length);
</script>

<button
  type="button"
  class="reviews-row"
  onclick={() => (isPanelOpen = true)}
>
  <span class="reviews-row-title">{m.list_title_comments()}</span>
  {#if $isLoading && $commentList.length === 0}
    <span class="reviews-row-count is-loading" aria-hidden="true"></span>
  {:else}
    <span class="reviews-row-count">{count}</span>
  {/if}
  <ChevronRightIcon />
</button>

{#if isPanelOpen}
  <CommentsPanel {...props} onClose={() => (isPanelOpen = false)} />
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .reviews-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    min-height: var(--ni-56);
    padding: var(--gap-s) 0;
    border: none;
    border-block: var(--ni-1) solid var(--color-border);
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    :global(svg) {
      flex-shrink: 0;
      width: var(--ni-18);
      height: var(--ni-18);
      color: var(--color-text-secondary);
    }

    @include for-mouse {
      &:hover .reviews-row-title {
        color: var(--trakttime-accent);
      }
    }
  }

  .reviews-row-title {
    flex: 1;
    font-family: var(--trakttime-font-heading);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .reviews-row-count {
    min-width: var(--ni-24);
    color: var(--color-text-secondary);
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    text-align: end;

    &.is-loading {
      width: var(--ni-32);
      height: 1rem;
      border-radius: var(--border-radius-s);
      @include shimmer-bg;
    }
  }
</style>
