<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  type Props = {
    /** Slimmer copy + smaller padding for tight contexts (login gate). */
    variant?: 'default' | 'compact';
  };

  const { variant = 'default' }: Props = $props();

  const HREF = 'https://github.com/hobo-Ware/tv-time-liberator';
</script>

<a
  class="liberator-cta"
  class:is-compact={variant === 'compact'}
  href={HREF}
  target="_blank"
  rel="noopener noreferrer"
>
  <div class="liberator-cta-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 7V5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2H6a1 1 0 0 0-1 1v3.5a.5.5 0 0 0 .5.5H7a2 2 0 0 1 0 4H5.5a.5.5 0 0 0-.5.5V18a1 1 0 0 0 1 1h3.5a.5.5 0 0 0 .5-.5V17a2 2 0 0 1 4 0v1.5a.5.5 0 0 0 .5.5H18a1 1 0 0 0 1-1v-3.5a.5.5 0 0 0-.5-.5H17a2 2 0 0 1 0-4h1.5a.5.5 0 0 0 .5-.5V8a1 1 0 0 0-1-1h-4z" />
    </svg>
  </div>
  <div class="liberator-cta-body">
    <p class="liberator-cta-title">{m.header_tv_time_liberator()}</p>
    <p class="liberator-cta-text">{m.text_tv_time_liberator()}</p>
  </div>
  <span class="liberator-cta-action">
    {m.button_text_get_extension()}
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
    </svg>
  </span>
</a>

<style lang="scss">
  .liberator-cta {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    padding: var(--gap-s) var(--gap-m);
    background: color-mix(in srgb, var(--trakttime-accent) 8%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--trakttime-accent) 25%, transparent);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease,
      transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    &:hover,
    &:focus-visible {
      background: color-mix(in srgb, var(--trakttime-accent) 14%, transparent);
      border-color: color-mix(
        in srgb,
        var(--trakttime-accent) 45%,
        transparent
      );
    }

    &:active {
      transform: scale(0.99);
    }

    &.is-compact {
      padding: var(--gap-xs) var(--gap-s);
      gap: var(--gap-xs);
    }
  }

  .liberator-cta-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--trakttime-accent) 18%, transparent);
    color: var(--trakttime-accent);

    svg {
      width: 1.125rem;
      height: 1.125rem;
    }
  }

  .liberator-cta-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .liberator-cta-title {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .liberator-cta-text {
    margin: 0;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .liberator-cta.is-compact .liberator-cta-title {
    font-size: 0.75rem;
  }

  .liberator-cta.is-compact .liberator-cta-text {
    display: none;
  }

  .liberator-cta-action {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--trakttime-accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;

    svg {
      width: 0.7rem;
      height: 0.7rem;
    }
  }

  /* Stack everything on mobile-narrow viewports so the action stays readable. */
  @media (max-width: 360px) {
    .liberator-cta {
      flex-wrap: wrap;
    }

    .liberator-cta-action {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
