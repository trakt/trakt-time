<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import ChevronRightIcon from '$lib/components/icons/ChevronRightIcon.svelte';
  import LockIcon from '$lib/components/icons/LockIcon.svelte';
  import TrophyIcon from '$lib/components/icons/TrophyIcon.svelte';
  import { getLocale } from '$lib/features/i18n/index.ts';
  import * as m from '$lib/paraglide/messages.js';
  import { toShortWatchTime } from '$lib/sections/profile/_internal/toUnitLabelParts.ts';
  import { toWatchTime } from '$lib/sections/profile/_internal/toWatchTime.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { useLeaderboard } from './useLeaderboard.ts';

  const { entries, viewerRank } = useLeaderboard();

  let isSheetOpen = $state(false);

  const locale = getLocale();
  const rankedCount = $derived($entries.filter((entry) => !entry.locked).length);
</script>

{#if $entries.length > 0}
  <button
    type="button"
    class="leaderboard-row"
    aria-label={m.button_label_open_leaderboard()}
    onclick={() => (isSheetOpen = true)}
  >
    <TrophyIcon />
    <span class="leaderboard-row-text">{m.header_leaderboard()}</span>
    {#if $viewerRank != null}
      <span class="leaderboard-row-rank">#{$viewerRank} / {rankedCount}</span>
    {/if}
    <ChevronRightIcon />
  </button>
{/if}

{#if isSheetOpen}
  <BottomSheet
    title={m.header_leaderboard()}
    subtitle={m.preview_feature_description_leaderboard()}
    onClose={() => (isSheetOpen = false)}
  >
    <ol class="leaderboard-list">
      {#each $entries as entry (entry.key)}
        <li class="leaderboard-entry" class:is-viewer={entry.isViewer}>
          <span class="leaderboard-rank">
            {#if entry.locked}
              <LockIcon />
            {:else}
              {entry.rank}
            {/if}
          </span>
          <a
            class="leaderboard-user"
            href={UrlBuilder.profile.user(entry.user.slug ?? entry.user.username)}
          >
            <UserAvatar name={entry.user.username} src={entry.user.avatar.url} size="xs" />
            <span class="leaderboard-name">
              {entry.isViewer ? m.text_leaderboard_you() : entry.user.username}
            </span>
          </a>
          {#if entry.totalMinutes != null}
            <span class="leaderboard-minutes">
              {toShortWatchTime(toWatchTime(entry.totalMinutes), locale)}
            </span>
          {/if}
        </li>
      {/each}
    </ol>
    {#if $entries.some((entry) => entry.locked)}
      <p class="leaderboard-upsell">{m.text_leaderboard_upsell_footer()}</p>
    {/if}
  </BottomSheet>
{/if}

<style lang="scss">
  .leaderboard-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    padding: var(--gap-s) var(--gap-m);
    border: none;
    border-top: var(--ni-1) solid var(--color-border);
    background: none;
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: start;
    cursor: pointer;

    > :global(svg) {
      flex-shrink: 0;
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
      color: var(--color-text-secondary);
    }

    > :global(svg:first-child) {
      color: var(--color-text-emphasis);
    }

    &:active {
      background: var(--color-floating-background);
    }

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: calc(var(--ni-2) * -1);
    }
  }

  .leaderboard-row-text {
    flex: 1;
    min-width: 0;
  }

  .leaderboard-row-rank {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary);
  }

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    margin: 0 calc(var(--gap-m) * -1);
    padding: 0;
    list-style: none;
  }

  .leaderboard-entry {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-xs) var(--gap-m);

    & + & {
      border-top: var(--ni-1) solid var(--color-border);
    }

    &.is-viewer {
      background: color-mix(in srgb, var(--trakttime-accent) 14%, transparent);
    }
  }

  .leaderboard-rank {
    display: inline-flex;
    justify-content: center;
    width: var(--ni-28);
    flex-shrink: 0;
    font-family: var(--trakttime-font-heading);
    font-weight: 700;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;

    :global(svg) {
      width: var(--ni-16);
      height: var(--ni-16);
    }
  }

  .leaderboard-user {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    flex: 1;
    min-width: 0;
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .leaderboard-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .leaderboard-minutes {
    flex-shrink: 0;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .leaderboard-upsell {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    text-align: center;
  }
</style>
