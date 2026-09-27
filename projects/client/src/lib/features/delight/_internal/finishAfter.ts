import { onMount } from 'svelte';

export function finishAfter(onDone: () => void, duration: number) {
  onMount(() => {
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  });
}
