<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import type { SentimentAnalysis } from '$lib/requests/models/SentimentAnalysis.ts';
  import InlineMarkdown from '$lib/components/markdown/InlineMarkdown.svelte';
  import SentimentAspects from './SentimentAspects.svelte';

  const { sentiment }: { sentiment: SentimentAnalysis } = $props();
</script>

<div class="sentiment-content">
  {#if sentiment.analysis}
    <p class="sentiment-analysis">
      <InlineMarkdown text={sentiment.analysis} />
    </p>
  {/if}

  {#if sentiment.highlight}
    <div class="sentiment-info-card" data-variant="highlight">
      <p class="sentiment-info-title">{m.header_sentiment_highlight()}</p>
      <p><InlineMarkdown text={sentiment.highlight} /></p>
    </div>
  {/if}

  <div class="sentiment-info-card">
    <p class="sentiment-info-title">{m.header_sentiment_aspects()}</p>
    <SentimentAspects pros={sentiment.aspect.pros} cons={sentiment.aspect.cons} />
  </div>
</div>

<style lang="scss">
  .sentiment-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);

    p {
      margin: 0;
    }
  }

  .sentiment-analysis {
    color: var(--color-text-primary);
    line-height: 1.5;
  }

  .sentiment-info-card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);

    padding: var(--gap-m);
    border-radius: var(--border-radius-m);
    background: var(--color-card-background);
    border: var(--ni-1) solid var(--color-border);

    line-height: 1.5;

    &[data-variant='highlight'] {
      background: var(--background-sentiment-highlight);
      border-color: var(--color-sentiment-highlight-border);
    }
  }

  .sentiment-info-title {
    font-weight: 700;
    color: var(--color-text-primary);
  }
</style>
