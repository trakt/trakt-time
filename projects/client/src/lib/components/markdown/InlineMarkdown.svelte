<script lang="ts">
  import { createSafeMarked } from '$lib/utils/markdown/createSafeMarked.ts';

  const { text }: { text: string } = $props();

  const marked = createSafeMarked();
</script>

<span class="inline-markdown">
  {@html marked.parseInline(text)}
</span>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .inline-markdown {
    :global(a) {
      @include default-link-style;

      text-decoration: underline;
      text-underline-offset: var(--ni-2);
      text-decoration-thickness: var(--ni-2);
    }
  }
</style>
