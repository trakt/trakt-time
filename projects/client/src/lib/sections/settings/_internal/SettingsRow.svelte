<script lang="ts">
  import type { Snippet } from 'svelte';

  type Tone = 'purple' | 'blue' | 'rose' | 'orange' | 'green';

  const {
    title,
    subtitle,
    icon,
    tone = 'purple',
    externalHref,
    children,
  }: Partial<ChildrenProps> & {
    title: string;
    subtitle?: string;
    icon?: Snippet;
    tone?: Tone;
    externalHref?: string;
  } = $props();
</script>

{#snippet contents()}
  {#if icon}
    <span class="trakt-settings-row-icon" data-tone={tone}>
      {@render icon()}
    </span>
  {/if}
  <span class="trakt-settings-row-text">
    <span class="trakt-settings-row-title">{title}</span>
    {#if subtitle}
      <span class="trakt-settings-row-subtitle">{subtitle}</span>
    {/if}
  </span>
  <span class="trakt-settings-row-content">
    {@render children?.()}
  </span>
{/snippet}

{#if externalHref}
  <a
    class="trakt-settings-row is-link"
    href={externalHref}
    target="_blank"
    rel="noopener noreferrer"
  >
    {@render contents()}
  </a>
{:else}
  <div class="trakt-settings-row">
    {@render contents()}
  </div>
{/if}

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .trakt-settings-row {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    min-height: var(--ni-56);
    padding: var(--gap-s) var(--gap-m);
    color: var(--color-text-primary);
    text-decoration: none;

    &.is-link {
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--transition-increment) ease-in-out;

      &:active {
        background: var(--color-floating-background);
      }

      @include for-mouse {
        &:hover {
          background: var(--color-floating-background);
        }
      }
    }
  }

  .trakt-settings-row-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: var(--ni-32);
    height: var(--ni-32);
    border-radius: var(--border-radius-m);
    color: var(--shade-10);

    &[data-tone='purple'] {
      background: var(--purple-600);
    }

    &[data-tone='blue'] {
      background: var(--blue-600);
    }

    &[data-tone='rose'] {
      background: var(--rose-500);
    }

    &[data-tone='orange'] {
      background: var(--orange-600);
    }

    &[data-tone='green'] {
      background: var(--green-600);
    }

    :global(svg) {
      width: var(--ni-18);
      height: var(--ni-18);
    }
  }

  .trakt-settings-row-text {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    flex: 1;
    min-width: 0;
  }

  .trakt-settings-row-title {
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .trakt-settings-row-subtitle {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .trakt-settings-row-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--gap-xs);
    flex-shrink: 0;
    color: var(--color-text-secondary);

    &:empty {
      display: none;
    }
  }
</style>
