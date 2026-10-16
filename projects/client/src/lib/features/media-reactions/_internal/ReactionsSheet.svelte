<script lang="ts">
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import ReactionPickerCell from '$lib/components/reactions/ReactionPickerCell.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { toBody } from '$lib/utils/actions/toBody.ts';
  import { MAX_MEDIA_REACTIONS } from '../constants.ts';
  import type { ReactionsSheetProps } from './ReactionsSheetProps.ts';
  import { toMediaReactionOptions } from './toMediaReactionOptions.ts';

  const { chosen, onSelect, onClose }: ReactionsSheetProps = $props();

  const options = toMediaReactionOptions();

  const COLUMNS = 6;
  const toWaveIndex = (index: number) =>
    Math.floor(index / COLUMNS) + (index % COLUMNS);
</script>

<div class="reactions-sheet" use:toBody>
  <BottomSheet title={m.header_media_reactions()} {onClose}>
    <div class="reactions-sheet-grid" style:--sheet-columns={COLUMNS}>
      {#each options as option, index (option.id)}
        <ReactionPickerCell
          {option}
          index={toWaveIndex(index)}
          size="large"
          {chosen}
          limit={MAX_MEDIA_REACTIONS}
          {onSelect}
        />
      {/each}
    </div>
  </BottomSheet>
</div>

<style lang="scss">
  .reactions-sheet {
    display: contents;
  }

  .reactions-sheet-grid {
    display: grid;
    grid-template-columns: repeat(var(--sheet-columns), var(--ni-40));
    justify-content: space-between;
    row-gap: var(--gap-xs);
    padding-block: var(--ni-8) var(--gap-m);
  }
</style>
