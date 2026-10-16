<script lang="ts">
  import ReactionPicker from '$lib/components/reactions/ReactionPicker.svelte';
  import ReactionsDistribution from '$lib/components/reactions/ReactionsDistribution.svelte';
  import { REACTIONS_CODE_MAP } from '$lib/components/reactions/constants.ts';
  import * as m from '$lib/paraglide/messages.js';
  import {
    type MediaReaction,
    MediaReactionSchema,
  } from '$lib/requests/models/MediaReaction.ts';
  import { toTranslatedReaction } from '$lib/utils/formatting/string/toTranslatedReaction.ts';
  import {
    MAX_MEDIA_REACTIONS,
    QUICK_MEDIA_REACTIONS,
  } from '../constants.ts';
  import type { ReactionsPopoverContentProps } from './ReactionsPopoverContentProps.ts';
  import { toMediaReactionOptions } from './toMediaReactionOptions.ts';

  const {
    chosen,
    onSelect,
    distribution,
    isLoading,
    onMore,
  }: ReactionsPopoverContentProps = $props();

  const DISTRIBUTION_PAGE_SIZE = 8;

  let isExpanded = $state(false);

  const options = toMediaReactionOptions();

  const toOption = (reaction: MediaReaction) => ({
    code: REACTIONS_CODE_MAP[reaction],
    label: toTranslatedReaction(reaction),
  });

  const reacted = $derived(
    MediaReactionSchema.options.filter(
      (reaction) => (distribution[reaction] ?? 0) > 0,
    ),
  );
</script>

{#if reacted.length > 0}
  <div
    class="popover-ranking"
    class:is-folded={isExpanded}
    inert={isExpanded}
  >
    <div class="popover-ranking-body">
      <ReactionsDistribution
        reactions={reacted}
        {distribution}
        current={chosen}
        {isLoading}
        title={m.header_media_reactions()}
        pageSize={DISTRIBUTION_PAGE_SIZE}
        limit={MAX_MEDIA_REACTIONS}
        {toOption}
        onRemove={onSelect}
        onAdd={onSelect}
      />
    </div>
  </div>
{/if}

<ReactionPicker
  {options}
  {chosen}
  limit={MAX_MEDIA_REACTIONS}
  {onSelect}
  quickCount={QUICK_MEDIA_REACTIONS.length}
  {isExpanded}
  onToggleExpanded={onMore ?? (() => (isExpanded = !isExpanded))}
/>

<style lang="scss">
  .popover-ranking {
    display: grid;
    grid-template-rows: 1fr;

    transition:
      grid-template-rows calc(var(--transition-increment) * 2)
        cubic-bezier(0.22, 1, 0.36, 1),
      opacity var(--transition-increment) ease-out;

    &.is-folded {
      grid-template-rows: 0fr;
      opacity: 0;
    }
  }

  .popover-ranking-body {
    min-height: 0;
    overflow: hidden;
  }
</style>
