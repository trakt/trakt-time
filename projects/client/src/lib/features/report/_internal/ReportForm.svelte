<script lang="ts">
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { ReportParams } from '../models/ReportParams.ts';
  import type { ReportReason } from '../models/ReportReason.ts';
  import { reasonLabel } from './reasonLabel.ts';
  import { reasonsFor } from './reasonsFor.ts';
  import { toTranslatedReportError } from './toTranslatedReportError.ts';
  import { useReport } from './useReport.ts';

  type ReportFormProps = {
    params: ReportParams;
    onClose: () => void;
  };

  const { params, onClose }: ReportFormProps = $props();

  let reason = $state<ReportReason | null>(null);
  let message = $state('');

  const { submit, isSubmitting, error } = useReport();

  const reasons = $derived(reasonsFor(params.type));
  const isValid = $derived(reason != null && message.trim().length > 0);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!reason || !isValid) return;

    const succeeded = await submit({ params, reason, message: message.trim() });
    if (succeeded) onClose();
  }
</script>

<form class="report-form" onsubmit={handleSubmit}>
  <fieldset class="report-reasons" disabled={$isSubmitting}>
    <legend class="report-legend">{m.input_placeholder_report_reason()}</legend>
    {#each reasons as value (value)}
      <label class="report-reason" class:is-selected={reason === value}>
        <input type="radio" name="reason" {value} bind:group={reason} />
        {reasonLabel(value)}
      </label>
    {/each}
  </fieldset>

  <textarea
    class="report-message"
    rows="4"
    required
    bind:value={message}
    placeholder={m.input_placeholder_report_message()}
    aria-label={m.input_placeholder_report_message()}
    disabled={$isSubmitting}
  ></textarea>

  {#if $error}
    <p class="report-error" role="alert">
      {toTranslatedReportError($error).replace(/<\/?a>/g, '')}
    </p>
  {/if}

  <button
    type="submit"
    class="report-submit"
    disabled={!isValid || $isSubmitting}
    aria-label={m.button_label_submit_report()}
  >
    {#if $isSubmitting}
      <LoadingIndicator />
    {:else}
      {m.button_text_submit_report()}
    {/if}
  </button>
</form>

<style lang="scss">
  .report-form {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .report-reasons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
    margin: 0;
    padding: 0;
    border: none;
  }

  .report-legend {
    width: 100%;
    margin-bottom: var(--gap-xs);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .report-reason {
    display: inline-flex;
    align-items: center;
    min-height: var(--ni-36);
    padding: 0 var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &:has(input:focus-visible) {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }

    &.is-selected {
      background: var(--trakttime-gradient);
      color: var(--trakttime-accent-foreground);
    }
  }

  .report-message {
    min-height: var(--ni-104);
    padding: var(--gap-s);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-card);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.9375rem;
    resize: vertical;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: 0;
    }
  }

  .report-error {
    margin: 0;
    color: var(--color-text-emphasis);
    font-size: 0.8125rem;
  }

  .report-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--ni-48);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
