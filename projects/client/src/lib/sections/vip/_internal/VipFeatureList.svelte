<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import ApiIcon from './icons/ApiIcon.svelte';
  import BookmarkIcon from './icons/BookmarkIcon.svelte';
  import ChatIcon from './icons/ChatIcon.svelte';
  import LibraryIcon from './icons/LibraryIcon.svelte';
  import ListIcon from './icons/ListIcon.svelte';
  import SentimentIcon from './icons/SentimentIcon.svelte';

  const vipFeatures = [
    {
      title: m.vip_feature_title_sentiment_trivia,
      description: m.vip_feature_description_sentiment_trivia,
      icon: SentimentIcon,
    },
    {
      title: m.vip_feature_title_bigger_watchlist,
      description: m.vip_feature_description_bigger_watchlist,
      icon: BookmarkIcon,
    },
    {
      title: m.vip_feature_title_more_lists,
      description: m.vip_feature_description_more_lists,
      icon: ListIcon,
    },
    {
      title: m.vip_feature_title_bigger_library,
      description: m.vip_feature_description_bigger_library,
      icon: LibraryIcon,
    },
    {
      title: m.vip_feature_title_api_apps,
      description: m.vip_feature_description_api_apps,
      icon: ApiIcon,
    },
    {
      title: m.vip_feature_title_support,
      description: m.vip_feature_description_support,
      icon: ChatIcon,
    },
  ] as const;
</script>

<section class="vip-feature-list">
  <h2 class="vip-feature-list-title">{m.text_vip_features_tagline()}</h2>

  <div class="vip-features">
    {#each vipFeatures as feature (feature.title)}
      {@const Icon = feature.icon}
      <div class="vip-feature">
        <div class="vip-feature-icon">
          <Icon />
        </div>
        <div class="vip-feature-body">
          <h3 class="vip-feature-title">{feature.title()}</h3>
          <p class="vip-feature-description">{feature.description()}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .vip-feature-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .vip-feature-list-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }

  .vip-features {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap-m);

    @include for-tablet-sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include for-desktop {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .vip-feature {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-s);
  }

  .vip-feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    width: var(--ni-36);
    height: var(--ni-36);

    background: color-mix(in srgb, var(--red-500) 15%, transparent);
    border: var(--ni-1) solid color-mix(in srgb, var(--red-500) 25%, transparent);
    border-radius: var(--border-radius-m);

    :global(svg) {
      width: var(--trakttime-icon-md);
      height: var(--trakttime-icon-md);
    }
  }

  .vip-feature-body {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
  }

  .vip-feature-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .vip-feature-description {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
</style>
