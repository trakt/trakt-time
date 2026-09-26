<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { on } from 'svelte/events';
  import { toActiveSectionId } from './toActiveSectionId.ts';

  const ACTIVATION_RATIO = 0.3;
  const BOTTOM_TOLERANCE_PX = 2;

  const sections = $derived([
    { id: 'appearance', label: m.header_appearance() },
    { id: 'your-data', label: m.header_your_data() },
    { id: 'about', label: m.header_about() },
    { id: 'account', label: m.header_account() },
  ]);

  let activeId = $state('appearance');
  let pinnedId: string | null = null;

  function readActiveSectionId() {
    const root = document.documentElement;
    return toActiveSectionId({
      sections: sections
        .map(({ id }) => document.getElementById(id))
        .filter((element): element is HTMLElement => element != null)
        .map((element) => ({
          id: element.id,
          top: element.getBoundingClientRect().top,
        })),
      activationLine: globalThis.innerHeight * ACTIVATION_RATIO,
      isAtBottom: globalThis.innerHeight + globalThis.scrollY >=
        root.scrollHeight - BOTTOM_TOLERANCE_PX,
    });
  }

  function syncActiveSection() {
    if (pinnedId) return;
    activeId = readActiveSectionId() ?? activeId;
  }

  function unpin() {
    pinnedId = null;
  }

  function pin(id: string) {
    pinnedId = id;
    activeId = id;
  }

  $effect(() => {
    syncActiveSection();

    const window = globalThis.window;
    const cleanups = [
      on(window, 'scroll', syncActiveSection, { passive: true }),
      on(window, 'resize', syncActiveSection, { passive: true }),
      on(window, 'wheel', unpin, { passive: true }),
      on(window, 'touchmove', unpin, { passive: true }),
      on(window, 'keydown', unpin),
    ];

    return () => cleanups.forEach((cleanup) => cleanup());
  });
</script>

<nav class="settings-nav" aria-label={m.page_title_settings()}>
  {#each sections as section (section.id)}
    <a
      href="#{section.id}"
      class="settings-nav-link"
      aria-current={activeId === section.id ? 'location' : undefined}
      onclick={() => pin(section.id)}
    >
      {section.label}
    </a>
  {/each}
</nav>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: var(--ni-2);
    padding: var(--gap-xs);
    border-radius: var(--border-radius-xl);
    background: var(--color-card-background);
  }

  .settings-nav-link {
    padding: var(--gap-xs) var(--gap-s);
    border-radius: var(--border-radius-m);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      color var(--transition-increment) ease-in-out,
      background-color var(--transition-increment) ease-in-out;

    &[aria-current='location'] {
      color: var(--color-text-primary);
      background: var(--color-floating-background);
    }

    @include for-mouse {
      &:hover {
        color: var(--color-text-primary);
      }
    }
  }
</style>
