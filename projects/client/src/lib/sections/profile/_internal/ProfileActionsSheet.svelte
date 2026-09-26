<script lang="ts">
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import BlockIcon from '$lib/components/icons/BlockIcon.svelte';
  import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';
  import FlagIcon from '$lib/components/icons/FlagIcon.svelte';
  import { ReportableType } from '$lib/features/report/models/ReportableType.ts';
  import { useReportDialog } from '$lib/features/report/useReportDialog.ts';
  import { useBlockUser } from '$lib/features/social/useBlockUser.ts';
  import { useFollowRequests } from '$lib/features/social/useFollowRequests.ts';
  import { isSameSlug } from '$lib/features/social/isSameSlug.ts';
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    slug: string;
    username: string;
    onClose: () => void;
  };

  const { slug, username, onClose }: Props = $props();

  const { isBlocked, isUpdatingBlock, blockUser, unblockUser } = $derived(
    useBlockUser({ slug, username }),
  );
  const { requests, pendingRequestIds, approve, deny } = useFollowRequests();
  const report = useReportDialog();

  const incomingRequest = $derived(
    $requests.find((request) => isSameSlug(request.user.slug, slug)) ?? null,
  );
  const isResponding = $derived(
    incomingRequest != null && $pendingRequestIds.has(incomingRequest.id),
  );

  const run = (action: () => unknown) => () => {
    onClose();
    action();
  };
</script>

<BottomSheet title={`@${username}`} {onClose}>
  <div class="actions-card">
    {#if incomingRequest}
      <button
        type="button"
        class="action-row"
        disabled={isResponding}
        aria-label={m.button_label_approve_follow_request({ username })}
        onclick={run(() => approve(incomingRequest.id))}
      >
        <CheckIcon />
        {m.button_text_approve_follow_request()}
      </button>
      <button
        type="button"
        class="action-row"
        disabled={isResponding}
        aria-label={m.button_label_reject_follow_request({ username })}
        onclick={run(() => deny(incomingRequest.id))}
      >
        <CloseIcon />
        {m.button_text_reject_follow_request()}
      </button>
    {/if}
    <button
      type="button"
      class="action-row"
      class:is-destructive={!$isBlocked}
      disabled={$isUpdatingBlock}
      aria-label={$isBlocked
        ? m.button_label_unblock({ username })
        : m.button_label_block({ username })}
      onclick={run(() => ($isBlocked ? unblockUser() : blockUser()))}
    >
      <BlockIcon />
      {$isBlocked ? m.button_text_unblock() : m.button_text_block()}
    </button>
    <button
      type="button"
      class="action-row"
      onclick={run(() => report.open({ type: ReportableType.User, id: slug }))}
    >
      <FlagIcon />
      {m.button_text_report()}
    </button>
  </div>
</BottomSheet>

<style lang="scss">
  .actions-card {
    display: flex;
    flex-direction: column;
    border-radius: var(--trakttime-radius-card);
    background: var(--color-floating-background);
    overflow: hidden;
  }

  .action-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    min-height: var(--ni-52);
    padding: 0 var(--gap-m);
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    text-align: start;
    cursor: pointer;

    & + & {
      border-top: var(--ni-1) solid var(--color-border);
    }

    :global(svg) {
      width: var(--ni-20);
      height: var(--ni-20);
      color: var(--color-text-secondary);
    }

    &.is-destructive {
      color: var(--color-text-emphasis);
    }

    &:disabled {
      opacity: 0.5;
      cursor: progress;
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }
  }
</style>
