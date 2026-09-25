<div class="profile-header-skeleton" aria-hidden="true">
  <div class="profile-skeleton-cover"></div>
  <div class="profile-skeleton-identity">
    <div class="profile-skeleton-avatar"></div>
    <div class="profile-skeleton-meta">
      <div class="profile-skeleton-line profile-skeleton-line--username"></div>
      <div class="profile-skeleton-line profile-skeleton-line--name"></div>
      <div class="profile-skeleton-line profile-skeleton-line--about"></div>
    </div>
  </div>
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  /* Mirrors the profile header footprint: cover, overlapping avatar ring,
     and the username / full-name lines. */
  .profile-header-skeleton {
    display: flex;
    flex-direction: column;
  }

  .profile-skeleton-cover {
    height: var(--trakttime-profile-cover-height);
    @include shimmer-bg;
  }

  .profile-skeleton-identity {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    padding: 0 var(--gap-m) var(--gap-m);
    margin-top: var(--trakttime-profile-offset);
  }

  .profile-skeleton-avatar {
    width: var(--trakttime-avatar-size);
    height: var(--trakttime-avatar-size);
    flex-shrink: 0;
    border-radius: 50%;
    box-shadow: 0 0 0 4px var(--color-background);
    @include shimmer-bg;
  }

  .profile-skeleton-meta {
    min-width: 0;
  }

  .profile-skeleton-line {
    border-radius: var(--border-radius-s);
    @include shimmer-bg;

    /* Heights track the username / full-name line boxes. */
    &--username {
      width: var(--ni-160);
      height: 1.875rem;
      animation-delay: 0.05s;
    }

    &--about {
      width: var(--ni-200);
      height: 1.25rem;
      margin-top: var(--gap-xxs);
      animation-delay: 0.15s;
    }

    &--name {
      width: var(--ni-88);
      height: 1.1875rem;
      margin-top: var(--ni-2);
      animation-delay: 0.1s;
    }
  }
</style>
