<script lang="ts">
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import TvTimeLiberatorCta from '$lib/components/tv-time-liberator-cta/TvTimeLiberatorCta.svelte';
  import { useImportInProgress } from '$lib/stores/useImportInProgress.ts';
  import { dropzone } from '$lib/utils/actions/dropzone.ts';
  import { slide } from 'svelte/transition';
  import {
    type ImportCounts,
    type ImportStatus,
    type UniversalImportItem,
  } from '../../import/ImportTypes.ts';
  import { TvTimeCsvParser } from '../../import/parsers/TvTimeCsvParser.ts';
  import { syncToTrakt } from '../../import/syncToTrakt.ts';
  import * as m from '$lib/paraglide/messages.js';
  import SettingsBlock from '../SettingsBlock.svelte';

  const { importInProgress } = useImportInProgress();

  type State = {
    status: ImportStatus;
    items: ReadonlyArray<UniversalImportItem>;
    processedCount: number;
    totalCount: number;
    errorCount: number;
    error: string | null;
  };

  let state = $state<State>({
    status: 'idle',
    items: [],
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    error: null,
  });

  const counts = $derived<ImportCounts>({
    history: state.items.filter((i) => i.action === 'history').length,
    watchlist: state.items.filter((i) => i.action === 'watchlist').length,
  });

  const progressPercent = $derived(
    state.totalCount === 0
      ? 0
      : Math.min(
        100,
        Math.round((state.processedCount / state.totalCount) * 100),
      ),
  );

  function reset() {
    state = {
      status: 'idle',
      items: [],
      processedCount: 0,
      totalCount: 0,
      errorCount: 0,
      error: null,
    };
  }

  async function handleFiles(ev: Event) {
    const { files } = (ev as CustomEvent<{ files: FileList }>).detail;
    if (!files?.length) return;

    state.status = 'parsing';
    state.error = null;

    try {
      const items = await TvTimeCsvParser.parse(Array.from(files));
      state.items = items;
      state.totalCount = items.length;
      state.status = items.length === 0 ? 'error' : 'review';
      if (items.length === 0) {
        state.error = m.import_error_empty();
      }
    } catch (err) {
      state.error = err instanceof Error ? err.message : String(err);
      state.status = 'error';
    }
  }

  async function startImport() {
    state.status = 'syncing';
    state.processedCount = 0;
    state.errorCount = 0;

    try {
      const failures = await syncToTrakt(state.items, {
        onProgress: (n) => {
          state.processedCount = n;
        },
        onError: (msg) => {
          // Per-chunk errors are surfaced via errorCount; log for diagnostics.
          console.error('[tv-time import]', msg);
        },
        onStart: () => importInProgress.next(true),
        onComplete: () => importInProgress.next(false),
      });
      state.errorCount = failures;
      state.status = 'complete';
    } catch (err) {
      state.error = err instanceof Error ? err.message : String(err);
      state.status = 'error';
    }
  }
</script>

<SettingsBlock
  title={m.header_import_tv_time()}
  description={m.description_import_tv_time()}
>
  <TvTimeLiberatorCta />

  <ol class="tv-time-import-steps">
    <li>{m.import_tv_time_step_export()}</li>
    <li>{m.import_tv_time_step_drop()}</li>
    <li>{m.import_tv_time_step_review()}</li>
  </ol>

  {#if state.status === 'idle' || state.status === 'parsing'}
    <div
      class="tv-time-dropzone"
      transition:slide={{ duration: 150, axis: 'y' }}
      use:dropzone={{ accept: '.csv', multiple: false }}
      onfiles={handleFiles}
    >
      {#if state.status === 'parsing'}
        <LoaderIcon />
        <p class="tv-time-secondary">{m.import_status_parsing()}</p>
      {:else}
        <p class="tv-time-prompt">{m.import_drop_csv()}</p>
        <p class="tv-time-secondary">{m.import_max_files({ count: 1 })}</p>
      {/if}
    </div>
  {/if}

  {#if state.status === 'review'}
    <div
      class="tv-time-summary"
      transition:slide={{ duration: 150, axis: 'y' }}
    >
      <div class="tv-time-counts">
        <p>{m.import_summary_history({ count: counts.history })}</p>
        {#if counts.watchlist > 0}
          <p>{m.import_summary_watchlist({ count: counts.watchlist })}</p>
        {/if}
      </div>
      <div class="tv-time-actions">
        <button class="tv-time-btn tv-time-btn--secondary" onclick={reset}>
          {m.button_text_cancel()}
        </button>
        <button class="tv-time-btn tv-time-btn--primary" onclick={startImport}>
          {m.button_text_start_import()}
        </button>
      </div>
    </div>
  {/if}

  {#if state.status === 'syncing'}
    <div
      class="tv-time-syncing"
      transition:slide={{ duration: 150, axis: 'y' }}
    >
      <p class="tv-time-secondary">
        {m.import_progress({
          processed: state.processedCount,
          total: state.totalCount,
        })}
      </p>
      <div class="tv-time-progress">
        <div class="tv-time-progress-fill" style:width="{progressPercent}%"></div>
      </div>
    </div>
  {/if}

  {#if state.status === 'complete'}
    <div
      class="tv-time-complete"
      transition:slide={{ duration: 150, axis: 'y' }}
    >
      <p>
        {m.import_complete_synced({
          count: state.processedCount - state.errorCount,
        })}
      </p>
      {#if state.errorCount > 0}
        <p class="tv-time-secondary">
          {m.import_complete_errors({ count: state.errorCount })}
        </p>
      {/if}
      <div class="tv-time-actions">
        <button class="tv-time-btn tv-time-btn--primary" onclick={reset}>
          {m.button_text_import_more()}
        </button>
      </div>
    </div>
  {/if}

  {#if state.status === 'error'}
    <div
      class="tv-time-error"
      transition:slide={{ duration: 150, axis: 'y' }}
    >
      <p>{state.error ?? m.import_error_generic()}</p>
      <div class="tv-time-actions">
        <button class="tv-time-btn tv-time-btn--secondary" onclick={reset}>
          {m.button_text_try_again()}
        </button>
      </div>
    </div>
  {/if}
</SettingsBlock>

<style lang="scss">
  .tv-time-import-steps {
    margin: 0;
    padding-left: var(--gap-l);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .tv-time-dropzone {
    border: 1.5px dashed var(--color-border);
    border-radius: var(--border-radius-m);
    padding: var(--gap-xl) var(--gap-m);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--gap-xs);
    text-align: center;
    transition: border-color 0.15s ease, background 0.15s ease;

    &:global(.dragover) {
      border-color: var(--trakttime-accent);
      background: color-mix(in srgb, var(--trakttime-accent) 8%, transparent);
    }
  }

  .tv-time-prompt {
    margin: 0;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .tv-time-secondary {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }

  .tv-time-summary,
  .tv-time-syncing,
  .tv-time-complete,
  .tv-time-error {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);

    p {
      margin: 0;
      color: var(--color-text-primary);
    }
  }

  .tv-time-counts {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .tv-time-progress {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border);
    overflow: hidden;
  }

  .tv-time-progress-fill {
    height: 100%;
    background: var(--trakttime-accent);
    transition: width 0.2s ease;
  }

  .tv-time-actions {
    display: flex;
    gap: var(--gap-s);
    justify-content: flex-end;
  }

  .tv-time-btn {
    border: none;
    border-radius: var(--border-radius-m);
    padding: var(--gap-s) var(--gap-l);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease, background 0.15s ease;

    &--primary {
      background: var(--trakttime-accent);
      color: var(--color-background);
    }

    &--secondary {
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    &:active {
      opacity: 0.8;
    }
  }
</style>
