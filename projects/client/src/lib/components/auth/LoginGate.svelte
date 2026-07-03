<script lang="ts">
  import { browser } from '$app/environment';
  import * as m from '$lib/paraglide/messages.js';

  const { login }: { login: () => void } = $props();

  const LIBERATOR_HREF = 'https://github.com/hobo-Ware/tv-time-liberator';
  const GDPR_HREF = 'https://gdpr.tvtime.com/gdpr/self-service';
</script>

{#if browser}
  <div class="login-gate">
    <div class="login-gate-glow" aria-hidden="true"></div>

    <div class="login-gate-hero">
      <div class="login-gate-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="m8 2 4 4 4-4" />
          <path d="m10 11.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h2 class="login-gate-title">{m.header_sign_in_to_trakt()}</h2>
      <p class="login-gate-message">{m.text_sign_in_pitch()}</p>
      <button class="login-gate-btn" onclick={login}>
        {m.button_text_sign_in_with_trakt()}
      </button>
    </div>

    <div class="login-gate-migrate">
      <span class="login-gate-badge">{m.welcome_tvtime_badge()}</span>
      <h3 class="login-gate-migrate-title">{m.welcome_tvtime_heading()}</h3>
      <p class="login-gate-migrate-body">{m.welcome_tvtime_body()}</p>
      <p class="login-gate-migrate-note">{m.welcome_tvtime_liberator_body()}</p>
      <div class="login-gate-migrate-actions">
        <a
          class="login-gate-migrate-link"
          href={LIBERATOR_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m.welcome_tvtime_liberator_cta()}
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
          </svg>
        </a>
        <a
          class="login-gate-migrate-link"
          href={GDPR_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m.welcome_tvtime_gdpr_cta()}
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z" />
          </svg>
        </a>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .login-gate {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-l);
    gap: var(--gap-xl);
    min-height: 60vh;
    text-align: center;
  }

  .login-gate-glow {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: min(48rem, 120vw);
    aspect-ratio: 1;
    background: radial-gradient(
      circle at center,
      color-mix(in srgb, var(--trakttime-accent) 22%, transparent) 0%,
      color-mix(in srgb, var(--trakttime-accent) 8%, transparent) 42%,
      transparent 70%
    );
    pointer-events: none;
  }

  .login-gate-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-m);
  }

  .login-gate-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--trakttime-accent) 14%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--trakttime-accent) 30%, transparent);
    color: var(--trakttime-accent);

    svg {
      width: 2rem;
      height: 2rem;
    }
  }

  .login-gate-title {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0;
  }

  .login-gate-message {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: var(--ni-320);
  }

  .login-gate-btn {
    margin-top: var(--gap-s);
    padding: var(--gap-s) var(--gap-xl);
    background: var(--trakttime-accent);
    color: #fff;
    border: none;
    border-radius: var(--border-radius-m);
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 8px 24px -8px
      color-mix(in srgb, var(--trakttime-accent) 60%, transparent);
    transition: transform var(--transition-increment) ease-in-out,
      box-shadow var(--transition-increment) ease-in-out,
      opacity var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-visible {
      transform: translateY(-1px);
      box-shadow: 0 12px 28px -8px
        color-mix(in srgb, var(--trakttime-accent) 75%, transparent);
    }

    &:active {
      transform: translateY(0);
      opacity: 0.9;
    }
  }

  .login-gate-migrate {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    max-width: 26rem;
    padding: var(--gap-l);
    background: color-mix(in srgb, var(--trakttime-accent) 6%, transparent);
    border: 1px solid
      color-mix(in srgb, var(--trakttime-accent) 22%, transparent);
    border-radius: var(--border-radius-l);
  }

  .login-gate-badge {
    padding: 2px var(--gap-s);
    background: color-mix(in srgb, var(--trakttime-accent) 24%, transparent);
    border-radius: var(--border-radius-m);
    color: var(--color-text-primary);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .login-gate-migrate-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .login-gate-migrate-body,
  .login-gate-migrate-note {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
  }

  .login-gate-migrate-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--gap-s) var(--gap-l);
    margin-top: var(--gap-xs);
  }

  .login-gate-migrate-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--trakttime-accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.15s ease;

    &:hover,
    &:focus-visible {
      opacity: 0.8;
    }

    svg {
      width: 0.7rem;
      height: 0.7rem;
    }
  }
</style>
