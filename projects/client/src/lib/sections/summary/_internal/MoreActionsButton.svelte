<script lang="ts">
  import MoreIcon from '$lib/components/icons/MoreIcon.svelte';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    title: string;
    onclick: () => void;
  };

  const { title, onclick }: Props = $props();
</script>

<button
  type="button"
  class="more-actions-btn icon-button-round"
  {onclick}
  aria-label={m.button_label_more_actions({ title })}
>
  <MoreIcon />
</button>

<style lang="scss">
  .more-actions-btn {
    border: none;
    cursor: pointer;
    padding: 0;

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
    }
  }
</style>
