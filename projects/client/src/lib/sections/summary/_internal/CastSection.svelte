<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { CastMember } from '$lib/requests/models/MediaCrew.ts';

  type Props = {
    cast: ReadonlyArray<CastMember>;
    isLoading: boolean;
    emptyMessage?: string;
  };

  const { cast, isLoading, emptyMessage }: Props = $props();
</script>

<section class="media-section">
  <h2 class="summary-section-title">{m.header_cast()}</h2>
  {#if isLoading && cast.length === 0}
    <div class="cast-row" aria-hidden="true">
      {#each Array(6) as _, i (`csk-${i}`)}
        <div class="cast-skeleton">
          <div class="cast-skeleton-avatar"></div>
          <div class="cast-skeleton-line cast-skeleton-line--name"></div>
          <div class="cast-skeleton-line cast-skeleton-line--char"></div>
        </div>
      {/each}
    </div>
  {:else if cast.length > 0}
    <div class="cast-row" role="list">
      {#each cast as member, i (`${member.key}-${i}`)}
        <a href="/people/{member.key}" class="cast-member">
          <div class="cast-avatar">
            {#if member.headshot.url.medium}
              <CrossOriginImage
                src={member.headshot.url.medium}
                alt={member.name}
              />
            {:else}
              <div class="cast-avatar-placeholder">
                {member.name.charAt(0)}
              </div>
            {/if}
          </div>
          <p class="cast-name">{member.name}</p>
          <p class="cast-character">{member.characterName}</p>
        </a>
      {/each}
    </div>
  {:else if emptyMessage}
    <p class="cast-empty">{emptyMessage}</p>
  {/if}
</section>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .media-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .cast-row {
    @include scrollable-row(var(--gap-s));
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .cast-member,
  .cast-skeleton {
    flex-shrink: 0;
    width: var(--trakttime-cast-card-width);
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
  }

  .cast-member {
    text-decoration: none;

    @include for-mouse {
      &:hover .cast-avatar :global(img) {
        transform: scale(1.04);
      }
    }
  }

  .cast-avatar,
  .cast-skeleton-avatar {
    width: 100%;
    aspect-ratio: 3 / 4;
    margin-bottom: var(--gap-xxs);
    border-radius: var(--trakttime-radius-card);
  }

  .cast-avatar {
    position: relative;
    overflow: hidden;
    background: color-mix(in srgb, var(--trakttime-accent) 10%, var(--color-card-background));

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform var(--transition-increment) ease-out;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 var(--ni-1) color-mix(in srgb, var(--color-text-primary) 8%, transparent);
      pointer-events: none;
    }
  }

  .cast-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--trakttime-font-heading);
    font-size: 2rem;
    font-weight: 700;
    background: var(--trakttime-gradient);
    background-clip: text;
    color: transparent;
  }

  .cast-name {
    font-size: 0.8125rem;
    line-height: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-character {
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-skeleton-avatar {
    @include shimmer-bg;
  }

  .cast-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    &--name {
      width: 80%;
      height: 1.125rem;
      animation-delay: 0.1s;
    }

    &--char {
      width: 60%;
      height: 1rem;
      animation-delay: 0.2s;
    }
  }

  .cast-empty {
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    margin: 0;
  }
</style>
