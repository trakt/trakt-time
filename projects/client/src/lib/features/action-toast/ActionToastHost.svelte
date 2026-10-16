<script lang="ts">
  import Snackbar from '$lib/components/snackbar/Snackbar.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { actionToastStore } from './_internal/actionToastStore.ts';
  import { ACTION_TOAST_DURATION } from './constants/index.ts';

  const toast = $derived($actionToastStore);

  const dismiss = () => actionToastStore.dismiss();

  const snackbarAction = $derived.by(() => {
    const action = toast?.action;
    if (!action) return undefined;

    return {
      text: action.text,
      label: action.label,
      onAction: async () => {
        actionToastStore.dismiss();

        try {
          await action.onAction();
        } catch {
          actionToastStore.notify({
            message: m.action_toast_action_failed(),
            variant: 'error',
          });
        }
      },
    };
  });
</script>

{#if toast}
  {#key toast.id}
    <Snackbar
      message={toast.message}
      action={snackbarAction}
      variant={toast.variant}
      durationMs={ACTION_TOAST_DURATION}
      onDismiss={dismiss}
    />
  {/key}
{/if}
