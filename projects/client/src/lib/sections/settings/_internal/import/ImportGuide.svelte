<script lang="ts">
  import type {
    ImportNote,
    ImportSourceGuide,
  } from '../../import/ImportTypes.ts';
  import { toLinkParts } from '../../import/toLinkParts.ts';

  type ImportGuideProps = { guide: ImportSourceGuide };

  const { guide }: ImportGuideProps = $props();
</script>

{#snippet note(value: ImportNote)}
  {#if typeof value === 'function'}
    <span class="import-guide-note">{value()}</span>
  {:else}
    <span class="import-guide-note">
      {value.text()}
      {#each value.values as item (item)}
        <code>{item}</code>
      {/each}
    </span>
  {/if}
{/snippet}

<div class="import-guide">
  {#if guide.description}
    <p class="import-guide-description">{guide.description()}</p>
  {/if}

  {#if guide.steps}
    <ol class="import-guide-steps">
      {#each guide.steps as step, index (index)}
        {@const parts = toLinkParts(step.text())}
        <li>
          {parts.before}{#if parts.label && step.href}<a
              href={step.href}
              target="_blank"
              rel="noopener noreferrer">{parts.label}</a
            >{:else}{parts.label}{/if}{parts.after}
        </li>
      {/each}
    </ol>
  {/if}

  {#if guide.guidelines}
    <p class="import-guide-description">{guide.guidelines.intro()}</p>
    <dl class="import-guide-fields">
      {#each guide.guidelines.fields as field (field.name)}
        <div class="import-guide-field">
          <dt><code>{field.name}</code></dt>
          <dd>
            {field.description()}
            {#if field.note}
              {@render note(field.note)}
            {/if}
          </dd>
        </div>
      {/each}
    </dl>
    <pre class="import-guide-example"><code>{guide.guidelines.example}</code></pre>
  {/if}
</div>

<style lang="scss">
  .import-guide {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
    line-height: 1.45;

    code {
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--color-text-primary);
    }
  }

  .import-guide-description {
    margin: 0;
  }

  .import-guide-steps {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xxs);
    margin: 0;
    padding-inline-start: var(--gap-l);

    a {
      color: var(--trakttime-accent);
      font-weight: 600;
    }
  }

  .import-guide-fields {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 0;
  }

  .import-guide-field {
    dt {
      margin: 0;
    }

    dd {
      display: flex;
      flex-direction: column;
      gap: var(--ni-2);
      margin: 0;
    }
  }

  .import-guide-note {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ni-4);
  }

  .import-guide-example {
    margin: 0;
    padding: var(--gap-s);
    border-radius: var(--border-radius-m);
    background: var(--color-background);
    overflow-x: auto;
  }
</style>
