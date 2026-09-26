<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';

  const sections = $derived([
    { id: 'appearance', label: m.header_appearance() },
    { id: 'your-data', label: m.header_your_data() },
    { id: 'about', label: m.header_about() },
    { id: 'account', label: m.header_account() },
  ]);

  let activeId = $state('appearance');

  $effect(() => {
    const targets = sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element != null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) activeId = visible.target.id;
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  });
</script>

<nav class="settings-nav" aria-label={m.page_title_settings()}>
  {#each sections as section (section.id)}
    <a
      href="#{section.id}"
      class="settings-nav-link"
      aria-current={activeId === section.id ? 'location' : undefined}
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
