<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { useWhereToWatch } from './useWhereToWatch.ts';

  type Props = {
    type: 'show' | 'movie';
    slug: string;
  };

  const { type, slug }: Props = $props();

  const { services } = $derived(useWhereToWatch({ type, slug }));
</script>

{#if $services.length > 0}
  <section class="media-section">
    <h2 class="section-title">{m.list_title_where_to_watch()}</h2>
    <ul class="services-row">
      {#each $services as service (service.key)}
        <li>
          <a
            class="service"
            href={service.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={service.name}
            style:--service-color={service.color}
          >
            {#if service.logoUrl}
              <CrossOriginImage src={service.logoUrl} alt={service.name} loading="lazy" />
            {:else}
              <span class="service-name">{service.name}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

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

  .services-row {
    @include scrollable-row(var(--gap-s));
    list-style: none;
    margin: 0 calc(-1 * var(--gap-m));
    padding: 0 var(--gap-m);
  }

  .service {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ni-56);
    height: var(--ni-56);
    border-radius: var(--border-radius-m);
    overflow: hidden;
    background: var(--service-color, var(--color-card-background));
    border: var(--ni-1) solid var(--color-border);
    text-decoration: none;

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  .service-name {
    padding: var(--gap-xxs);
    font-size: 0.625rem;
    font-weight: 600;
    text-align: center;
    color: var(--color-text-primary);
    overflow-wrap: anywhere;
  }
</style>
