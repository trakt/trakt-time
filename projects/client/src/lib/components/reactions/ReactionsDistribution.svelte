<script lang="ts" generics="T extends string">
  import ReactionIcon from '$lib/components/icons/ReactionIcon.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import { chunk } from '$lib/utils/array/chunk.ts';
  import { hasReactionRoom } from '$lib/utils/reactions/hasReactionRoom.ts';
  import { toReactionShare } from '$lib/utils/reactions/toReactionShare.ts';
  import ReactionDetails from './ReactionDetails.svelte';
  import type { ReactionsDistributionProps } from './ReactionsDistributionProps.ts';

  const {
    reactions,
    distribution,
    current,
    isLoading,
    title,
    pageSize,
    limit,
    toOption,
    onRemove,
    onAdd,
  }: ReactionsDistributionProps<T> = $props();

  const countOf = (reaction: T) => distribution?.[reaction] ?? 0;

  const total = $derived(
    reactions.reduce((sum, reaction) => sum + countOf(reaction), 0),
  );

  const ranked = $derived(
    reactions.toSorted((a, b) => countOf(b) - countOf(a)),
  );

  const pages = $derived(chunk(ranked, pageSize));

  const isAddable = $derived(hasReactionRoom({ count: current.length, limit }));

  let activePage = $state(0);

  function scrollHandler(event: Event) {
    const { scrollLeft, clientWidth } = event.currentTarget as HTMLElement;
    activePage = Math.round(scrollLeft / Math.max(clientWidth, 1));
  }
</script>

<div class="reactions-distribution" class:is-loading={isLoading}>
  <span class="distribution-header">
    <ReactionIcon />{title}
  </span>

  <div class="distribution-pages" onscroll={scrollHandler}>
    {#each pages as page, pageIndex (pageIndex)}
      <div class="distribution-grid">
        {#each page as reaction (reaction)}
          {@const { code, label } = toOption(reaction)}
          <ReactionDetails
            {reaction}
            {code}
            {label}
            value={toReactionShare({
              count: countOf(reaction),
              total,
              locale: getLocale(),
            })}
            isCurrent={current.includes(reaction)}
            {onRemove}
            onAdd={isAddable ? onAdd : undefined}
          />
        {/each}
      </div>
    {/each}
  </div>

  <div class="distribution-dots" class:is-hidden={pages.length < 2} aria-hidden="true">
    {#each pages as _, pageIndex (pageIndex)}
      <span class="distribution-dot" class:is-active={pageIndex === activePage}></span>
    {/each}
  </div>
</div>

<style lang="scss">
  .reactions-distribution {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    margin: var(--ni-8);
    padding: var(--ni-16);
    background: var(--color-reaction-distribution-background);
    border-radius: var(--trakttime-radius-card);
    overflow: hidden;

    &.is-loading .distribution-pages {
      opacity: 0.5;
    }
  }

  .distribution-header {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-secondary);

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }

  .distribution-pages {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    transition: opacity var(--transition-increment) ease-in-out;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .distribution-grid {
    flex: 0 0 100%;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(2, var(--ni-30));
    row-gap: var(--ni-12);
    column-gap: var(--ni-4);
    scroll-snap-align: start;
  }

  .distribution-dots {
    display: flex;
    justify-content: center;
    gap: var(--ni-4);
    height: var(--ni-4);

    &.is-hidden {
      visibility: hidden;
    }
  }

  .distribution-dot {
    width: var(--ni-4);
    height: var(--ni-4);
    border-radius: 50%;
    background: var(--color-text-secondary);
    opacity: 0.4;
    transition: opacity var(--transition-increment) ease-out;

    &.is-active {
      opacity: 1;
    }
  }
</style>
