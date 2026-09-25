<script lang="ts">
  import NavigationGuard from '$lib/components/NavigationGuard.svelte';
  import LoaderIcon from '$lib/components/icons/LoaderIcon.svelte';
  import UploadIcon from '$lib/components/icons/UploadIcon.svelte';
  import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
  import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import UpsellCta from '$lib/features/upsell/UpsellCta.svelte';
  import { useImportInProgress } from '$lib/stores/useImportInProgress.ts';
  import { useInvalidator } from '$lib/stores/useInvalidator.ts';
  import { dropzone } from '$lib/utils/actions/dropzone.ts';
  import { slide } from 'svelte/transition';
  import * as m from '$lib/paraglide/messages.js';
  import {
    type AmbiguousImportItem,
    DEFAULT_EPISODE_MATCH_MODE,
    type EpisodeMatchMode,
    IMPORT_SOURCE_CONFIGS,
    type ImportAction,
    type ImportActionSelection,
    type ImportCounts,
    type ImportStatus,
    type UniversalImportItem,
  } from '../../import/ImportTypes.ts';
  import { exceedsFreeImportLimits } from '../../import/exceedsFreeImportLimits.ts';
  import { filterImportItemsByActionSelection } from '../../import/filterImportItemsByActionSelection.ts';
  import { TvTimeCsvParser } from '../../import/parsers/TvTimeCsvParser.ts';
  import { syncToTrakt } from '../../import/syncToTrakt.ts';
  import ImportComplete from './ImportComplete.svelte';
  import SettingsBlock from '../SettingsBlock.svelte';
  import SettingsRow from '../SettingsRow.svelte';

  const { importInProgress } = useImportInProgress();
  const { invalidate } = useInvalidator();
  const { user, limits } = useUser();

  const sourceConfig = IMPORT_SOURCE_CONFIGS.tvtime;

  let abortController: AbortController | null = null;

  type State = {
    status: ImportStatus;
    items: ReadonlyArray<UniversalImportItem>;
    processedCount: number;
    totalCount: number;
    errorCount: number;
    unresolved: ReadonlyArray<UniversalImportItem>;
    ambiguous: ReadonlyArray<AmbiguousImportItem>;
    matchProcessedCount: number;
    matchTotalCount: number;
    error: string | null;
    selectedActions: ImportActionSelection;
    episodeMatch: EpisodeMatchMode;
  };

  const initialState: State = {
    status: 'idle',
    items: [],
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    unresolved: [],
    ambiguous: [],
    matchProcessedCount: 0,
    matchTotalCount: 0,
    error: null,
    selectedActions: { history: true, watchlist: true, ratings: true, list: true },
    episodeMatch: DEFAULT_EPISODE_MATCH_MODE,
  };

  let state = $state<State>({ ...initialState });

  const counts = $derived<ImportCounts>({
    history: state.items.filter((i) => i.action === 'history').length,
    watchlist: state.items.filter((i) => i.action === 'watchlist').length,
    ratings: state.items.filter((i) => i.action === 'ratings').length,
    list: state.items.filter((i) => i.action === 'list').length,
  });

  const actionRows = $derived<
    ReadonlyArray<{ action: ImportAction; label: string; count: number }>
  >(
    [
      {
        action: 'history' as const,
        count: counts.history,
        label: m.import_summary_history({ count: counts.history }),
      },
      {
        action: 'watchlist' as const,
        count: counts.watchlist,
        label: m.import_summary_watchlist({ count: counts.watchlist }),
      },
      {
        action: 'ratings' as const,
        count: counts.ratings,
        label: m.import_summary_ratings({ count: counts.ratings }),
      },
      {
        action: 'list' as const,
        count: counts.list,
        label: m.import_summary_list({ count: counts.list }),
      },
    ].filter((row) => row.count > 0),
  );

  const selectedItems = $derived(
    filterImportItemsByActionSelection({
      items: state.items,
      selectedActions: state.selectedActions,
    }),
  );

  const hasEpisodes = $derived(
    state.items.some((item) => item.type === 'episode'),
  );

  const isOverFreeLimit = $derived.by(() => {
    if ($user?.isVip || !$limits) return false;

    return exceedsFreeImportLimits({
      counts: {
        history: state.selectedActions.history ? counts.history : 0,
        watchlist: state.selectedActions.watchlist ? counts.watchlist : 0,
        ratings: state.selectedActions.ratings ? counts.ratings : 0,
        list: state.selectedActions.list ? counts.list : 0,
      },
      limits: $limits,
    });
  });

  function toggleAction(action: ImportAction) {
    state.selectedActions = {
      ...state.selectedActions,
      [action]: !state.selectedActions[action],
    };
  }

  function toggleEpisodeMatch() {
    state.episodeMatch = state.episodeMatch === 'positional' ? 'id' : 'positional';
  }

  const progressPercent = $derived(
    state.totalCount === 0
      ? 0
      : Math.min(
        100,
        Math.round((state.processedCount / state.totalCount) * 100),
      ),
  );

  const matchPercent = $derived(
    state.matchTotalCount === 0
      ? 0
      : Math.min(
        100,
        Math.round((state.matchProcessedCount / state.matchTotalCount) * 100),
      ),
  );

  function reset() {
    abortController?.abort();
    abortController = null;
    state = { ...initialState };
  }

  async function handleFiles(ev: Event) {
    const { files } = (ev as CustomEvent<{ files: FileList }>).detail;
    if (!files?.length) return;

    state.status = 'parsing';
    state.error = null;

    try {
      const fileArray = Array.from(files).slice(0, sourceConfig.maxFiles);
      const items = await TvTimeCsvParser.parse(fileArray);
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

  async function invalidateImported(success: boolean) {
    importInProgress.next(false);

    if (success) {
      await invalidate(InvalidateAction.Watchlisted('show'));
      await invalidate(InvalidateAction.Watchlisted('movie'));
      await invalidate(InvalidateAction.MarkAsWatched('show'));
      await invalidate(InvalidateAction.MarkAsWatched('movie'));
      await invalidate(InvalidateAction.Rated('show'));
      await invalidate(InvalidateAction.Rated('movie'));
      await invalidate(InvalidateAction.Listed('show'));
      await invalidate(InvalidateAction.Listed('movie'));
    }
  }

  async function startImport() {
    abortController = new AbortController();
    state.status = 'syncing';
    state.processedCount = 0;
    state.errorCount = 0;
    state.matchProcessedCount = 0;
    state.matchTotalCount = 0;
    state.totalCount = selectedItems.length;

    try {
      const { errorCount, unresolved, ambiguous } = await syncToTrakt(
        selectedItems,
        {
          signal: abortController.signal,
          episodeMatch: state.episodeMatch,
          onMatchProgress: (processed, total) => {
            state.matchProcessedCount = processed;
            state.matchTotalCount = total;
            state.status = total > 0 ? 'matching' : 'syncing';
          },
          onProgress: (n) => {
            state.status = 'syncing';
            state.processedCount = n;
          },
          onError: (msg) => {
            // Per-chunk errors are surfaced via errorCount; log for diagnostics.
            console.error('[tv-time import]', msg);
          },
          onStart: () => importInProgress.next(true),
          onComplete: invalidateImported,
        },
      );
      state.errorCount = errorCount;
      state.unresolved = unresolved;
      state.ambiguous = ambiguous;
      state.status = 'complete';
    } catch (err) {
      state.error = err instanceof Error ? err.message : String(err);
      state.status = 'error';
    }
  }

  async function importPicked(
    picked: UniversalImportItem[],
    skipped: UniversalImportItem[],
  ) {
    if (picked.length > 0) {
      abortController = new AbortController();
      const { errorCount } = await syncToTrakt(picked, {
        signal: abortController.signal,
        episodeMatch: state.episodeMatch,
        onProgress: () => {},
        onError: (msg) => {
          console.error('[tv-time import]', msg);
        },
        onStart: () => importInProgress.next(true),
        onComplete: invalidateImported,
      });

      state.errorCount += errorCount;
    }

    state.unresolved = [...state.unresolved, ...skipped];
    state.ambiguous = [];
  }
</script>

{#snippet step(title: string, body: string)}
  <li class="tv-time-step">
    <span class="tv-time-step-title">{title}</span>
    {body}
  </li>
{/snippet}

<SettingsBlock title={m.header_your_data()}>
  <SettingsRow
    title={m.header_import_tv_time()}
    subtitle={m.import_tv_time_intro()}
    tone="rose"
  >
    {#snippet icon()}
      <UploadIcon />
    {/snippet}
  </SettingsRow>

  <div class="tv-time-panel">
    <ol class="tv-time-steps">
      {@render step(m.import_step_export_title(), m.import_step_export_body())}
      {@render step(m.import_step_upload_title(), m.import_step_upload_body())}
      {@render step(m.import_step_sync_title(), m.import_step_sync_body())}
    </ol>

    <NavigationGuard
      isActive={state.status === 'matching' || state.status === 'syncing'}
      confirmationParams={{ type: ConfirmationType.CancelImport }}
      onreset={reset}
    >
      {#if state.status === 'idle' || state.status === 'parsing'}
        <div
          class="tv-time-dropzone"
          transition:slide={{ duration: 150, axis: 'y' }}
          use:dropzone={{ accept: sourceConfig.accept, multiple: true }}
          onfiles={handleFiles}
        >
          {#if state.status === 'parsing'}
            <LoaderIcon />
            <p class="tv-time-secondary">{m.import_status_parsing()}</p>
          {:else}
            <p class="tv-time-prompt">{m.import_drop_zip()}</p>
            <p class="tv-time-secondary">
              {m.import_max_files({ count: sourceConfig.maxFiles })}
            </p>
          {/if}
        </div>
      {/if}

      {#if state.status === 'review'}
        <div
          class="tv-time-summary"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <div class="tv-time-counts">
            {#each actionRows as row (row.action)}
              <label class="tv-time-option">
                <input
                  type="checkbox"
                  checked={state.selectedActions[row.action]}
                  onchange={() => toggleAction(row.action)}
                />
                <span>{row.label}</span>
              </label>
            {/each}
          </div>
          {#if hasEpisodes}
            <label class="tv-time-option">
              <input
                type="checkbox"
                checked={state.episodeMatch === 'positional'}
                onchange={toggleEpisodeMatch}
              />
              <span class="tv-time-option-text">
                <span>{m.import_match_toggle_label()}</span>
                <span class="tv-time-secondary">{m.import_match_toggle_hint()}</span>
              </span>
            </label>
          {/if}
          {#if isOverFreeLimit}
            <UpsellCta source="tv-time-import">
              {m.import_vip_limit_exceeded({ count: selectedItems.length })}
            </UpsellCta>
          {/if}
          <div class="tv-time-actions">
            <button class="tv-time-btn tv-time-btn--secondary" onclick={reset}>
              {m.button_text_cancel()}
            </button>
            <button
              class="tv-time-btn tv-time-btn--primary"
              onclick={startImport}
              disabled={selectedItems.length === 0}
            >
              {m.button_text_start_import()}
            </button>
          </div>
        </div>
      {/if}

      {#if state.status === 'matching'}
        <div
          class="tv-time-syncing"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <p class="tv-time-secondary">
            {m.import_status_matching({
              processed: state.matchProcessedCount,
              total: state.matchTotalCount,
            })}
          </p>
          <div class="tv-time-progress">
            <div class="tv-time-progress-fill" style:width="{matchPercent}%"></div>
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
        <div transition:slide={{ duration: 150, axis: 'y' }}>
          <ImportComplete
            processedCount={state.processedCount}
            errorCount={state.errorCount}
            unresolved={state.unresolved}
            ambiguous={state.ambiguous}
            onimportpicked={importPicked}
            onreset={reset}
          />
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
    </NavigationGuard>
  </div>
</SettingsBlock>

<style lang="scss">
  .tv-time-panel {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    padding: var(--gap-m);
  }

  .tv-time-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--gap-xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tv-time-step {
    display: flex;
    flex-direction: column;
    gap: var(--ni-4);
    padding: var(--gap-s);
    border-radius: var(--border-radius-m);
    background: var(--color-background);
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    line-height: 1.35;
  }

  .tv-time-step-title {
    font-family: var(--trakttime-font-heading);
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-text-emphasis);
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
  .tv-time-error {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .tv-time-syncing,
  .tv-time-error {
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

  .tv-time-option {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-s);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    cursor: pointer;

    input {
      flex-shrink: 0;
      margin: var(--ni-2) 0 0;
      accent-color: var(--trakttime-accent);
    }
  }

  .tv-time-option-text {
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

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
