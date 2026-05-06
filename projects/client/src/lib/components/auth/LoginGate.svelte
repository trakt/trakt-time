<script lang="ts">
  import { browser } from '$app/environment';
  import * as m from '$lib/paraglide/messages.js';

  const { login }: { login: () => void } = $props();
</script>

{#if browser}
  <div class="login-gate">
    <div class="login-gate-icon">🎬</div>
    <h2 class="login-gate-title">{m.header_sign_in_to_trakt()}</h2>
    <p class="login-gate-message">{m.text_sign_in_pitch()}</p>
    <button class="login-gate-btn" onclick={login}>
      {m.button_text_sign_in_with_trakt()}
    </button>
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .login-gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--gap-xxl) var(--gap-l);
    gap: var(--gap-m);
    min-height: 40vh;
    text-align: center;
  }

  .login-gate-icon {
    font-size: 2.5rem;
    line-height: 1;
  }

  .login-gate-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .login-gate-message {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: var(--ni-240);
  }

  .login-gate-btn {
    margin-top: var(--gap-s);
    padding: var(--gap-s) var(--gap-l);
    background: var(--trakttime-accent);
    color: #fff;
    border: none;
    border-radius: var(--border-radius-m);
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-increment) ease-in-out;

    &:hover,
    &:focus-visible {
      opacity: 0.85;
    }
  }
</style>
