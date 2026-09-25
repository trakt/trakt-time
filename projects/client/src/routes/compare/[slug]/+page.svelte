<script lang="ts">
  import ComparePage from '$lib/features/compare/ComparePage.svelte';
  import type { PageProps } from './$types.ts';

  const { data }: PageProps = $props();
</script>

<ComparePage competitor={data.competitor} />
