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
    DEFAULT_IMPORT_SOURCE,
    IMPORT_SOURCE_CONFIGS,
    type ImportAction,
    type ImportSource,
    type ImportActionSelection,
    type ImportCounts,
    type ImportStatus,
    type UniversalImportItem,
  } from '../../import/ImportTypes.ts';
  import { exceedsFreeImportLimits } from '../../import/exceedsFreeImportLimits.ts';
  import { filterImportItemsByActionSelection } from '../../import/filterImportItemsByActionSelection.ts';
  import { getParser } from '../../import/parsers/getParser.ts';
  import { syncToTrakt } from '../../import/syncToTrakt.ts';
  import ImportComplete from './ImportComplete.svelte';
  import ImportGuide from './ImportGuide.svelte';
  import SettingsBlock from '../SettingsBlock.svelte';
  import SettingsRow from '../SettingsRow.svelte';

  const { importInProgress } = useImportInProgress();
  const { invalidate } = useInvalidator();
  const { user, limits } = useUser();

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

  let importState = $state<State>({ ...initialState });

  const sources = Object.values(IMPORT_SOURCE_CONFIGS);

  let source = $state<ImportSource>(DEFAULT_IMPORT_SOURCE);
  const sourceConfig = $derived(IMPORT_SOURCE_CONFIGS[source]);
  const canSwitchSource = $derived(
    importState.status === 'idle' || importState.status === 'error',
  );

  const counts = $derived<ImportCounts>({
    history: importState.items.filter((i) => i.action === 'history').length,
    watchlist: importState.items.filter((i) => i.action === 'watchlist').length,
    ratings: importState.items.filter((i) => i.action === 'ratings').length,
    list: importState.items.filter((i) => i.action === 'list').length,
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
      items: importState.items,
      selectedActions: importState.selectedActions,
    }),
  );

  const hasEpisodes = $derived(
    importState.items.some((item) => item.type === 'episode'),
  );

  const isOverFreeLimit = $derived.by(() => {
    if ($user?.isVip || !$limits) return false;

    return exceedsFreeImportLimits({
      counts: {
        history: importState.selectedActions.history ? counts.history : 0,
        watchlist: importState.selectedActions.watchlist ? counts.watchlist : 0,
        ratings: importState.selectedActions.ratings ? counts.ratings : 0,
        list: importState.selectedActions.list ? counts.list : 0,
      },
      limits: $limits,
    });
  });

  function toggleAction(action: ImportAction) {
    importState.selectedActions = {
      ...importState.selectedActions,
      [action]: !importState.selectedActions[action],
    };
  }

  function toggleEpisodeMatch() {
    importState.episodeMatch = importState.episodeMatch === 'positional' ? 'id' : 'positional';
  }

  const progressPercent = $derived(
    importState.totalCount === 0
      ? 0
      : Math.min(
        100,
        Math.round((importState.processedCount / importState.totalCount) * 100),
      ),
  );

  const matchPercent = $derived(
    importState.matchTotalCount === 0
      ? 0
      : Math.min(
        100,
        Math.round((importState.matchProcessedCount / importState.matchTotalCount) * 100),
      ),
  );

  function selectSource(next: ImportSource) {
    reset();
    source = next;
  }

  function reset() {
    abortController?.abort();
    abortController = null;
    importState = { ...initialState };
  }

  async function handleFiles(ev: Event) {
    const { files } = (ev as CustomEvent<{ files: FileList }>).detail;
    if (!files?.length) return;

    importState.status = 'parsing';
    importState.error = null;

    try {
      const fileArray = Array.from(files).slice(0, sourceConfig.maxFiles);
      const items = await getParser(source).parse(fileArray);
      importState.items = items;
      importState.totalCount = items.length;
      importState.status = items.length === 0 ? 'error' : 'review';
      if (items.length === 0) {
        importState.error = m.import_error_empty();
      }
    } catch (err) {
      importState.error = err instanceof Error ? err.message : String(err);
      importState.status = 'error';
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
    importState.status = 'syncing';
    importState.processedCount = 0;
    importState.errorCount = 0;
    importState.matchProcessedCount = 0;
    importState.matchTotalCount = 0;
    importState.totalCount = selectedItems.length;

    try {
      const { errorCount, unresolved, ambiguous } = await syncToTrakt(
        selectedItems,
        {
          signal: abortController.signal,
          episodeMatch: importState.episodeMatch,
          onMatchProgress: (processed, total) => {
            importState.matchProcessedCount = processed;
            importState.matchTotalCount = total;
            importState.status = total > 0 ? 'matching' : 'syncing';
          },
          onProgress: (n) => {
            importState.status = 'syncing';
            importState.processedCount = n;
          },
          onError: (msg) => {
            // Per-chunk errors are surfaced via errorCount; log for diagnostics.
            console.error('[import]', msg);
          },
          onStart: () => importInProgress.next(true),
          onComplete: invalidateImported,
        },
      );
      importState.errorCount = errorCount;
      importState.unresolved = unresolved;
      importState.ambiguous = ambiguous;
      importState.status = 'complete';
    } catch (err) {
      importState.error = err instanceof Error ? err.message : String(err);
      importState.status = 'error';
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
        episodeMatch: importState.episodeMatch,
        onProgress: () => {},
        onError: (msg) => {
          console.error('[import]', msg);
        },
        onStart: () => importInProgress.next(true),
        onComplete: invalidateImported,
      });

      importState.errorCount += errorCount;
    }

    importState.unresolved = [...importState.unresolved, ...skipped];
    importState.ambiguous = [];
  }
</script>

<SettingsBlock title={m.header_your_data()}>
  <SettingsRow
    title={m.header_import_data()}
    subtitle={m.import_data_intro()}
    tone="rose"
  >
    {#snippet icon()}
      <UploadIcon />
    {/snippet}
  </SettingsRow>

  <div class="import-panel">
    <div
      class="import-sources"
      role="group"
      aria-label={m.import_source_label()}
    >
      {#each sources as option (option.id)}
        <button
          type="button"
          class="import-source"
          aria-pressed={option.id === source}
          disabled={!canSwitchSource}
          onclick={() => selectSource(option.id)}
        >
          {option.name}
        </button>
      {/each}
    </div>

    <ImportGuide guide={sourceConfig.guide} />

    <NavigationGuard
      isActive={importState.status === 'matching' || importState.status === 'syncing'}
      confirmationParams={{ type: ConfirmationType.CancelImport }}
      onreset={reset}
    >
      {#if importState.status === 'idle' || importState.status === 'parsing'}
        <div
          class="import-dropzone"
          transition:slide={{ duration: 150, axis: 'y' }}
          use:dropzone={{ accept: sourceConfig.accept, multiple: true }}
          onfiles={handleFiles}
        >
          {#if importState.status === 'parsing'}
            <LoaderIcon />
            <p class="import-secondary">{m.import_status_parsing()}</p>
          {:else}
            <p class="import-prompt">{m.import_drop_files()}</p>
            <p class="import-secondary">
              {m.import_max_files({ count: sourceConfig.maxFiles })}
            </p>
          {/if}
        </div>
      {/if}

      {#if importState.status === 'review'}
        <div
          class="import-summary"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <div class="import-counts">
            {#each actionRows as row (row.action)}
              <label class="import-option">
                <input
                  type="checkbox"
                  checked={importState.selectedActions[row.action]}
                  onchange={() => toggleAction(row.action)}
                />
                <span>{row.label}</span>
              </label>
            {/each}
          </div>
          {#if hasEpisodes}
            <label class="import-option">
              <input
                type="checkbox"
                checked={importState.episodeMatch === 'positional'}
                onchange={toggleEpisodeMatch}
              />
              <span class="import-option-text">
                <span>{m.import_match_toggle_label()}</span>
                <span class="import-secondary">{m.import_match_toggle_hint()}</span>
              </span>
            </label>
          {/if}
          {#if isOverFreeLimit}
            <UpsellCta source="import-import">
              {m.import_vip_limit_exceeded({ count: selectedItems.length })}
            </UpsellCta>
          {/if}
          <div class="import-actions">
            <button class="import-btn import-btn--secondary" onclick={reset}>
              {m.button_text_cancel()}
            </button>
            <button
              class="import-btn import-btn--primary"
              onclick={startImport}
              disabled={selectedItems.length === 0}
            >
              {m.button_text_start_import()}
            </button>
          </div>
        </div>
      {/if}

      {#if importState.status === 'matching'}
        <div
          class="import-syncing"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <p class="import-secondary">
            {m.import_status_matching({
              processed: importState.matchProcessedCount,
              total: importState.matchTotalCount,
            })}
          </p>
          <div class="import-progress">
            <div class="import-progress-fill" style:width="{matchPercent}%"></div>
          </div>
        </div>
      {/if}

      {#if importState.status === 'syncing'}
        <div
          class="import-syncing"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <p class="import-secondary">
            {m.import_progress({
              processed: importState.processedCount,
              total: importState.totalCount,
            })}
          </p>
          <div class="import-progress">
            <div class="import-progress-fill" style:width="{progressPercent}%"></div>
          </div>
        </div>
      {/if}

      {#if importState.status === 'complete'}
        <div transition:slide={{ duration: 150, axis: 'y' }}>
          <ImportComplete
            processedCount={importState.processedCount}
            errorCount={importState.errorCount}
            unresolved={importState.unresolved}
            ambiguous={importState.ambiguous}
            onimportpicked={importPicked}
            onreset={reset}
          />
        </div>
      {/if}

      {#if importState.status === 'error'}
        <div
          class="import-error"
          transition:slide={{ duration: 150, axis: 'y' }}
        >
          <p>{importState.error ?? m.import_error_generic()}</p>
          <div class="import-actions">
            <button class="import-btn import-btn--secondary" onclick={reset}>
              {m.button_text_try_again()}
            </button>
          </div>
        </div>
      {/if}
    </NavigationGuard>
  </div>
</SettingsBlock>

<style lang="scss">
  .import-panel {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
    padding: var(--gap-m);
  }

  .import-sources {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .import-source {
    min-height: var(--ni-36);
    padding: 0 var(--gap-m);
    border: var(--ni-1) solid var(--color-border);
    border-radius: var(--trakttime-radius-pill);
    background: transparent;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background var(--transition-increment) ease-in-out,
      color var(--transition-increment) ease-in-out;

    &[aria-pressed='true'] {
      border-color: transparent;
      background: var(--trakttime-accent);
      color: var(--trakttime-accent-foreground);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .import-dropzone {
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

  .import-prompt {
    margin: 0;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .import-secondary {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }

  .import-summary,
  .import-syncing,
  .import-error {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .import-syncing,
  .import-error {
    p {
      margin: 0;
      color: var(--color-text-primary);
    }
  }

  .import-counts {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .import-option {
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

  .import-option-text {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .import-progress {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border);
    overflow: hidden;
  }

  .import-progress-fill {
    height: 100%;
    background: var(--trakttime-accent);
    transition: width 0.2s ease;
  }

  .import-actions {
    display: flex;
    gap: var(--gap-s);
    justify-content: flex-end;
  }

  .import-btn {
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
