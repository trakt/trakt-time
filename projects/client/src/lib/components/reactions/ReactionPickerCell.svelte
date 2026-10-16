<script lang="ts" generics="T extends string">
  import * as m from '$lib/paraglide/messages.js';
  import { hasReactionRoom } from '$lib/utils/reactions/hasReactionRoom.ts';
  import ReactionEmoji from './ReactionEmoji.svelte';
  import type { ReactionPickerCellProps } from './ReactionPickerCellProps.ts';

  const {
    option,
    index,
    chosen,
    limit,
    onSelect,
    size = 'normal',
  }: ReactionPickerCellProps<T> = $props();

  const isChosen = $derived(chosen.includes(option.id));
  const isDisabled = $derived(
    !isChosen && !hasReactionRoom({ count: chosen.length, limit }),
  );

  let isPressed = $state(false);

  function pressHandler() {
    isPressed = false;
    requestAnimationFrame(() => (isPressed = true));

    onSelect(option.id);
  }

  function animationEndHandler(event: AnimationEvent) {
    if (!event.animationName.endsWith('reaction-press')) return;

    isPressed = false;
  }
</script>

<div
  class="picker-cell"
  class:is-chosen={isChosen}
  class:is-pressed={isPressed}
  data-size={size}
  style:--reaction-index={index}
  onanimationend={animationEndHandler}
>
  <button
    type="button"
    class="picker-cell-button"
    aria-label={m.button_label_react({ reaction: option.label })}
    aria-pressed={isChosen}
    disabled={isDisabled}
    onclick={pressHandler}
  >
    <span class="picker-cell-emoji">
      <ReactionEmoji code={option.code} label={option.label} />
    </span>
  </button>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .picker-cell {
    --reaction-emoji-size: var(--ni-24);
    --animation-duration: calc(var(--transition-increment) * 2);
    --delay-factor: calc(var(--animation-duration) / 6);

    &[data-size='large'] {
      --reaction-emoji-size: var(--ni-32);
    }
  }

  .picker-cell-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-40);
    height: var(--ni-40);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    opacity: 0;
    animation: bump-in var(--animation-duration) ease-in forwards;
    animation-delay: calc(var(--reaction-index) * var(--delay-factor));

    transition: background-color var(--transition-increment) ease-in-out;

    @include for-mouse {
      &:hover:not(:disabled) {
        background: var(--color-reaction-background-hover);
      }
    }

    &:focus-visible {
      outline: var(--border-thickness-xs) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  .picker-cell-emoji {
    display: flex;
    transition: var(--transition-increment) ease-out;
    transition-property: opacity, filter;
  }

  .picker-cell-button:disabled .picker-cell-emoji {
    opacity: 0.35;
    filter: grayscale(1);
  }

  .picker-cell.is-chosen .picker-cell-button {
    background: var(--color-current-reaction-background);

    @include for-mouse {
      &:hover:not(:disabled) {
        background: var(--color-current-reaction-hover);
      }
    }
  }

  .picker-cell.is-pressed .picker-cell-emoji {
    animation: reaction-press calc(var(--transition-increment) * 2) ease-out;
  }

  @keyframes reaction-press {
    30% {
      transform: scale(0.8);
    }

    65% {
      transform: scale(1.2);
    }

    100% {
      transform: scale(1);
    }
  }
</style>
