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
  <h2 class="section-title">{m.header_cast()}</h2>
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
      {#each cast as member (member.key)}
        <a href="/people/{member.key}" class="cast-member">
          <div class="cast-avatar">
            {#if member.headshot.url.thumb}
              <CrossOriginImage
                src={member.headshot.url.thumb}
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

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .cast-row {
    @include scrollable-row(var(--gap-m));
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .cast-member {
    flex-shrink: 0;
    width: 68px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-decoration: none;
  }

  .cast-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .cast-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  .cast-name {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-character {
    font-size: 0.625rem;
    color: var(--color-text-secondary);
    margin: 0;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cast-skeleton {
    flex-shrink: 0;
    width: 68px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  .cast-skeleton-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    @include shimmer-bg;
  }

  .cast-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    &--name {
      width: var(--ni-56);
      height: 0.6875rem;
      animation-delay: 0.1s;
    }

    &--char {
      width: var(--ni-44);
      height: 0.625rem;
      animation-delay: 0.2s;
    }
  }

  .cast-empty {
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    margin: 0;
  }
</style>
