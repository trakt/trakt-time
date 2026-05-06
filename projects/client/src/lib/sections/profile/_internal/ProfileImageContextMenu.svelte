<script lang="ts">
  import CoverImageIcon from '$lib/components/icons/CoverImageIcon.svelte';
  import DeleteIcon from '$lib/components/icons/DeleteIcon.svelte';
  import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { Popover } from 'bits-ui';
  import type { Snippet } from 'svelte';

  const {
    trigger,
    onViewPhoto,
    onUploadPhoto,
    onRemovePhoto,
  }: {
    trigger: Snippet<[Record<string, unknown>]>;
    onViewPhoto: () => void;
    onUploadPhoto: () => void;
    onRemovePhoto: () => void;
  } = $props();

  let open = $state(false);

  const closeAnd = (action: () => void) => () => {
    open = false;
    action();
  };
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      {@render trigger(props)}
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      class="profile-image-context-menu"
      sideOffset={8}
      align="center"
    >
      <button
        class="menu-item"
        onclick={closeAnd(onViewPhoto)}
        aria-label={m.button_label_view_photo()}
      >
        <ProfileIcon />
        <span>{m.button_text_view_photo()}</span>
      </button>

      <button
        class="menu-item"
        onclick={closeAnd(onUploadPhoto)}
        aria-label={m.button_label_upload_photo()}
      >
        <CoverImageIcon />
        <span>{m.button_text_upload_photo()}</span>
      </button>

      <hr class="menu-divider" />

      <button
        class="menu-item menu-item--destructive"
        onclick={closeAnd(onRemovePhoto)}
        aria-label={m.button_label_remove_photo()}
      >
        <DeleteIcon />
        <span>{m.button_text_remove_photo()}</span>
      </button>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style lang="scss">
  :global(.profile-image-context-menu) {
    z-index: var(--layer-top);
    background-color: var(--color-card-background);
    border-radius: var(--border-radius-l);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    padding: var(--gap-xs);
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 2px;

    animation: menu-in 0.15s ease-out forwards;
  }

  @keyframes menu-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .menu-item {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: color-mix(
        in srgb,
        var(--color-text-primary) 8%,
        transparent
      );
    }

    &:focus-visible {
      outline: 1.5px solid var(--color-text-primary);
      outline-offset: -2px;
    }

    &--destructive {
      color: var(--red-500, #e02760);
    }

    :global(svg) {
      width: 1.125rem;
      height: 1.125rem;
      flex-shrink: 0;
    }
  }

  .menu-divider {
    all: unset;
    display: block;
    height: 1px;
    background-color: color-mix(
      in srgb,
      var(--color-text-primary) 10%,
      transparent
    );
    margin: var(--gap-xxs) var(--gap-xs);
  }
</style>
