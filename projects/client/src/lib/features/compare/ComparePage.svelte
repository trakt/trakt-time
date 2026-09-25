<script lang="ts">
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { toFaqJsonLd } from '$lib/features/seo/json-ld/toFaqJsonLd.ts';
  import * as m from '$lib/paraglide/messages.js';
  import CompareHeader from './CompareHeader.svelte';
  import { COMPETITORS, type Competitor } from './competitors.ts';

  type ComparePageProps = { competitor: Competitor };

  const { competitor }: ComparePageProps = $props();

  const { isAuthorized, login } = useAuth();

  const name = $derived(competitor.name);

  const rows = $derived([
    {
      feature: m.compare_row_maker(),
      traktTime: m.compare_trakt_time_maker(),
      competitor: competitor.maker(),
    },
    {
      feature: m.compare_row_platforms(),
      traktTime: m.compare_trakt_time_platforms(),
      competitor: competitor.platforms(),
    },
    {
      feature: m.compare_row_price(),
      traktTime: m.compare_trakt_time_price(),
      competitor: competitor.price(),
    },
    {
      feature: m.compare_row_tracks(),
      traktTime: m.compare_trakt_time_tracks(),
      competitor: competitor.tracks(),
    },
    {
      feature: m.compare_row_import(),
      traktTime: m.compare_yes(),
      competitor: competitor.importsTvTime ? m.compare_yes() : m.compare_no(),
    },
    {
      feature: m.compare_row_history(),
      traktTime: m.compare_trakt_time_history(),
      competitor: competitor.history(),
    },
    {
      feature: m.compare_row_community(),
      traktTime: m.compare_trakt_time_community(),
      competitor: competitor.community(),
    },
  ]);

  const faq = $derived([
    {
      question: m.compare_faq_same_q({ name }),
      answer: m.compare_faq_same_a({ name }),
    },
    {
      question: m.compare_faq_import_q(),
      answer: m.compare_faq_import_a(),
    },
    {
      question: m.compare_faq_both_q({ name }),
      answer: competitor.bothAnswer(),
    },
  ]);

  const others = $derived(
    COMPETITORS.filter(({ slug }) => slug !== competitor.slug),
  );
</script>

<SeoHead
  title={m.compare_title({ name })}
  description={competitor.description()}
  jsonLd={[toFaqJsonLd(faq)]}
/>

<main class="compare-page">
  <CompareHeader title={m.compare_title({ name })} intro={competitor.intro()} />

  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead>
        <tr>
          <th scope="col">{m.compare_column_feature()}</th>
          <th scope="col" class="compare-product">Trakt Time</th>
          <th scope="col">{name}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.feature)}
          <tr>
            <th scope="row">{row.feature}</th>
            <td class="compare-product">{row.traktTime}</td>
            <td>{row.competitor}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="compare-actions">
    {#if $isAuthorized}
      <a class="compare-cta" href="/settings">{m.welcome_tvtime_import_cta()}</a>
    {:else}
      <button class="compare-cta" type="button" onclick={login}>
        {m.button_text_sign_in_with_trakt()}
      </button>
    {/if}
  </div>

  <section class="compare-faq">
    <h2 class="compare-faq-heading">{m.compare_faq_heading()}</h2>
    {#each faq as item (item.question)}
      <div class="compare-faq-item">
        <h3 class="compare-faq-question">{item.question}</h3>
        <p class="compare-faq-answer">{item.answer}</p>
      </div>
    {/each}
  </section>

  <nav class="compare-more" aria-labelledby="compare-more-heading">
    <h2 id="compare-more-heading" class="compare-faq-heading">
      {m.compare_more_heading()}
    </h2>
    <ul class="compare-more-list">
      {#each others as other (other.slug)}
        <li>
          <a class="compare-more-link" href="/compare/{other.slug}">
            {m.compare_title({ name: other.name })}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <p class="compare-disclaimer">{m.compare_disclaimer({ name })}</p>
</main>

<style lang="scss">
  .compare-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xl);
    padding: var(--gap-xl) var(--gap-m) var(--trakttime-bottom-nav-height);
  }

  .compare-table-wrap {
    overflow-x: auto;
    border-radius: var(--trakttime-radius-card);
    background: var(--color-card-background);
  }

  .compare-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    line-height: 1.4;

    th,
    td {
      padding: var(--gap-s);
      text-align: start;
      vertical-align: top;
      border-bottom: var(--ni-1) solid var(--color-border);
    }

    tr:last-child th,
    tr:last-child td {
      border-bottom: none;
    }

    thead th {
      font-family: var(--trakttime-font-heading);
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    tbody th {
      width: 28%;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    td {
      color: var(--color-text-primary);
    }

    .compare-product {
      color: var(--trakttime-accent);
    }

    tbody .compare-product {
      color: var(--color-text-primary);
      background: color-mix(in srgb, var(--trakttime-accent) 8%, transparent);
    }
  }

  .compare-actions {
    display: flex;
  }

  .compare-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--ni-52);
    padding: 0 var(--gap-xl);
    border: none;
    border-radius: var(--trakttime-radius-pill);
    background: var(--trakttime-gradient);
    color: var(--trakttime-accent-foreground);
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .compare-faq {
    display: flex;
    flex-direction: column;
    gap: var(--gap-m);
  }

  .compare-faq-heading {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .compare-faq-item {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
    max-width: 38rem;
  }

  .compare-faq-question {
    font-size: 1rem;
    font-weight: 600;
  }

  .compare-faq-answer {
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--color-text-secondary);
  }

  .compare-more {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .compare-more-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .compare-more-link {
    display: inline-flex;
    align-items: center;
    min-height: var(--ni-40);
    padding: 0 var(--gap-m);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }

  .compare-disclaimer {
    max-width: 38rem;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
</style>
