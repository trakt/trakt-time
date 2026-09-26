<script lang="ts">
  import BravoIcon from '$lib/components/icons/BravoIcon.svelte';
  import EyeOffIcon from '$lib/components/icons/EyeOffIcon.svelte';
  import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
  import LaughIcon from '$lib/components/icons/LaughIcon.svelte';
  import ShockedIcon from '$lib/components/icons/ShockedIcon.svelte';
  import ThumbsDownIcon from '$lib/components/icons/ThumbsDownIcon.svelte';
  import ThumbsUpIcon from '$lib/components/icons/ThumbsUpIcon.svelte';
  import type { Reaction } from '$lib/requests/queries/comments/commentReactionsQuery.ts';

  const { reaction }: { reaction: Reaction } = $props();

  const ICONS = {
    like: ThumbsUpIcon,
    dislike: ThumbsDownIcon,
    love: HeartIcon,
    laugh: LaughIcon,
    shocked: ShockedIcon,
    bravo: BravoIcon,
    spoiler: EyeOffIcon,
  } as const;

  const Icon = $derived(ICONS[reaction]);
</script>

<span class="reaction-icon" data-reaction={reaction}>
  <Icon />
</span>

<style lang="scss">
  .reaction-icon {
    display: inline-flex;
    color: var(--color-text-secondary);

    &[data-reaction='like'] {
      color: var(--blue-500);
    }

    &[data-reaction='love'] {
      color: var(--rose-500);
    }

    &[data-reaction='laugh'] {
      color: var(--orange-400);
    }

    &[data-reaction='shocked'] {
      color: var(--rose-400);
    }

    &[data-reaction='bravo'] {
      color: var(--green-500);
    }

    &[data-reaction='spoiler'] {
      color: var(--purple-300);
    }
  }
</style>
