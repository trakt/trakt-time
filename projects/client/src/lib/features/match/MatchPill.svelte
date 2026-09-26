<script lang="ts">
  import UserAvatar from '$lib/components/avatar/UserAvatar.svelte';
  import BottomSheet from '$lib/components/bottom-sheet/BottomSheet.svelte';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import { useUser } from '$lib/features/auth/stores/useUser.ts';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import * as m from '$lib/paraglide/messages.js';
  import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
  import { userMatchQuery } from '$lib/requests/queries/users/userMatchQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import { matchLabel } from './matchLabel.ts';

  type SharedPoster = {
    id: number;
    type: 'show' | 'movie';
    slug: string;
    title: string;
    posterUrl: string;
  };

  type Props = {
    profile: UserProfile;
    favorites: ReadonlyArray<SharedPoster>;
  };

  const { profile, favorites }: Props = $props();

  const SHARED_POSTER_LIMIT = 8;

  const { user } = useUser();
  const slug = $derived(profile.slug ?? profile.username);
  const matchQuery = $derived(useQuery(userMatchQuery({ slug })));
  const match = $derived($matchQuery.data);

  let isSheetOpen = $state(false);

  const label = $derived(match ? matchLabel(match.score) : '');

  const shared = $derived.by(() => {
    if (!match) return [];
    const ids = new Set([
      ...match.shared.favorites.shows.map((id) => `show-${id}`),
      ...match.shared.favorites.movies.map((id) => `movie-${id}`),
    ]);
    return favorites
      .filter((poster) => ids.has(`${poster.type}-${poster.id}`))
      .slice(0, SHARED_POSTER_LIMIT);
  });
</script>

{#if $matchQuery.isLoading}
  <span class="match-pill match-pill--skeleton" aria-label={m.match_pill_loading_aria_label()}>
    <span class="match-pill-score">00%</span>
    <span class="match-pill-label">{m.match_label_crossover()}</span>
  </span>
{:else if match && match.score > 0}
  <button
    type="button"
    class="match-pill"
    aria-label={m.match_pill_aria_label({ score: match.score, label })}
    onclick={() => (isSheetOpen = true)}
  >
    <span class="match-pill-score">{match.score}%</span>
    <span class="match-pill-label">{label}</span>
  </button>
{/if}

{#if isSheetOpen && match}
  <BottomSheet
    title={m.match_drawer_title()}
    subtitle={m.match_drawer_subject({ username: profile.username })}
    onClose={() => (isSheetOpen = false)}
  >
    <div class="match-hero">
      <UserAvatar name={$user.username} src={$user.avatar.url} size="l" />
      <div class="match-gauge" style:--match-score="{match.score * 3.6}deg">
        <div class="match-gauge-inner">
          <span class="match-gauge-score">{match.score}%</span>
          <span class="match-gauge-label">{label}</span>
        </div>
      </div>
      <UserAvatar name={profile.username} src={profile.avatar.url} size="l" />
    </div>
    <p class="match-caption">{m.match_drawer_overlap_caption()}</p>

    <div class="match-breakdown">
      <div class="match-stat">
        <span class="match-stat-label">{m.match_drawer_breakdown_topics()}</span>
        <span class="match-stat-value">{match.breakdown.subgenres}%</span>
      </div>
      <div class="match-stat">
        <span class="match-stat-label">{m.match_drawer_breakdown_favorites()}</span>
        <span class="match-stat-value">{match.breakdown.favorites}%</span>
      </div>
    </div>

    {#if match.shared.subgenres.length > 0}
      <section class="match-section">
        <span class="match-section-title">{m.match_drawer_shared_topics_header()}</span>
        <div class="match-chips">
          {#each match.shared.subgenres as topic (topic.id)}
            <span class="match-chip">{topic.name}</span>
          {/each}
        </div>
      </section>
    {/if}

    {#if shared.length > 0}
      <section class="match-section">
        <span class="match-section-title">{m.header_favorites()}</span>
        <div class="match-posters">
          {#each shared as poster (`${poster.type}-${poster.id}`)}
            <a
              class="match-poster"
              href={UrlBuilder.media(poster.type, poster.slug)}
              aria-label={poster.title}
            >
              <CrossOriginImage src={poster.posterUrl} alt="" />
            </a>
          {/each}
        </div>
      </section>
    {/if}
  </BottomSheet>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .match-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-xs);
    box-sizing: border-box;
    height: var(--ni-32);
    margin-top: var(--gap-s);
    padding: var(--ni-4) var(--gap-s) var(--ni-4) var(--ni-4);
    border: var(--ni-1) solid
      color-mix(in srgb, var(--color-text-emphasis) 35%, transparent);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;

    &:focus-visible {
      outline: var(--ni-2) solid var(--trakttime-accent);
      outline-offset: var(--ni-2);
    }
  }

  .match-pill--skeleton {
    border-color: transparent;
    color: transparent;
    cursor: default;
    @include shimmer-bg;

    .match-pill-score {
      background: none;
      color: transparent;
    }
  }

  .match-pill-score {
    padding: var(--ni-2) var(--gap-xs);
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font-family: var(--trakttime-font-heading);
    font-weight: 700;
  }

  .match-hero {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-m);
  }

  .match-gauge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-132);
    height: var(--ni-132);
    border-radius: 50%;
    background: conic-gradient(
      var(--rose-500) 0deg,
      var(--purple-500) var(--match-score),
      var(--color-border) var(--match-score) 360deg
    );
  }

  .match-gauge-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: var(--ni-112);
    height: var(--ni-112);
    border-radius: 50%;
    background: var(--color-card-background);
    text-align: center;
  }

  .match-gauge-score {
    font-family: var(--trakttime-font-heading);
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-text-primary);
  }

  .match-gauge-label {
    padding: 0 var(--gap-xs);
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }

  .match-caption {
    margin: 0;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .match-breakdown {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap-xs);
  }

  .match-stat {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    padding: var(--gap-s);
    border-radius: var(--border-radius-l);
    background: var(--color-floating-background);
  }

  .match-stat-label {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .match-stat-value {
    font-family: var(--trakttime-font-heading);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .match-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .match-section-title {
    font-family: var(--trakttime-font-heading);
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .match-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
  }

  .match-chip {
    padding: var(--ni-4) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-floating-background);
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .match-posters {
    @include scrollable-row;
    gap: var(--gap-xs);
  }

  .match-poster {
    flex-shrink: 0;
    width: var(--ni-96);
    aspect-ratio: 2 / 3;
    border-radius: var(--border-radius-m);
    overflow: hidden;
    background: var(--color-floating-background);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
</style>
