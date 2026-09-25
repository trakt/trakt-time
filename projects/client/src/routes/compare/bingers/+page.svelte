<script lang="ts">
  import { useAuth } from '$lib/features/auth/stores/useAuth.ts';
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { toFaqJsonLd } from '$lib/features/seo/json-ld/toFaqJsonLd.ts';
  import * as m from '$lib/paraglide/messages.js';

  const { isAuthorized, login } = useAuth();

  const rows = $derived([
    {
      feature: m.compare_bingers_row_maker(),
      traktTime: m.compare_bingers_maker_trakt_time(),
      bingers: m.compare_bingers_maker_bingers(),
    },
    {
      feature: m.compare_bingers_row_platforms(),
      traktTime: m.compare_bingers_platforms_trakt_time(),
      bingers: m.compare_bingers_platforms_bingers(),
    },
    {
      feature: m.compare_bingers_row_price(),
      traktTime: m.compare_bingers_price_trakt_time(),
      bingers: m.compare_bingers_price_bingers(),
    },
    {
      feature: m.compare_bingers_row_import(),
      traktTime: m.compare_bingers_yes(),
      bingers: m.compare_bingers_yes(),
    },
    {
      feature: m.compare_bingers_row_history(),
      traktTime: m.compare_bingers_history_trakt_time(),
      bingers: m.compare_bingers_history_bingers(),
    },
    {
      feature: m.compare_bingers_row_community(),
      traktTime: m.compare_bingers_community_trakt_time(),
      bingers: m.compare_bingers_community_bingers(),
    },
  ]);

  const faq = $derived([
    {
      question: m.compare_bingers_faq_same_q(),
      answer: m.compare_bingers_faq_same_a(),
    },
    {
      question: m.compare_bingers_faq_import_q(),
      answer: m.compare_bingers_faq_import_a(),
    },
    {
      question: m.compare_bingers_faq_both_q(),
      answer: m.compare_bingers_faq_both_a(),
    },
  ]);
</script>

<SeoHead
  title={m.compare_bingers_title()}
  description={m.compare_bingers_description()}
  jsonLd={[toFaqJsonLd(faq)]}
/>

<main class="compare-page">
  <header class="compare-header">
    <h1 class="compare-title">{m.compare_bingers_title()}</h1>
    <p class="compare-intro">{m.compare_bingers_intro()}</p>
  </header>

  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead>
        <tr>
          <th scope="col">{m.compare_bingers_column_feature()}</th>
          <th scope="col" class="compare-product">Trakt Time</th>
          <th scope="col">Bingers</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.feature)}
          <tr>
            <th scope="row">{row.feature}</th>
            <td class="compare-product">{row.traktTime}</td>
            <td>{row.bingers}</td>
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
    <h2 class="compare-faq-heading">{m.compare_bingers_faq_heading()}</h2>
    {#each faq as item (item.question)}
      <div class="compare-faq-item">
        <h3 class="compare-faq-question">{item.question}</h3>
        <p class="compare-faq-answer">{item.answer}</p>
      </div>
    {/each}
  </section>

  <p class="compare-disclaimer">{m.compare_bingers_disclaimer()}</p>
</main>

<style lang="scss">
  .compare-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xl);
    padding: var(--gap-xl) var(--gap-m) var(--trakttime-bottom-nav-height);
  }

  .compare-header {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .compare-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.1;
    text-wrap: balance;
  }

  .compare-intro {
    max-width: 38rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
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

  .compare-disclaimer {
    max-width: 38rem;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
</style>
