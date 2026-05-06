<script lang="ts">
  import { useNowPlaying } from "$lib/features/toast/useNowPlaying";
  import NavbarStateSetter from "$lib/sections/navbar/NavbarStateSetter.svelte";
  import NowPlayingContent from "$lib/sections/toast/_internal/NowPlayingContent.svelte";
  import { useCurrentUserNowWatching } from "$lib/sections/toast/_internal/useCurrentUserNowWatching";
  import { onMount } from "svelte";

  const { nowWatching } = useCurrentUserNowWatching();
  const { nowPlaying } = useNowPlaying();

  onMount(() => {
    const unsubscribeNowWatching = nowWatching.subscribe((val) =>
      nowPlaying.next(val),
    );

    return () => {
      unsubscribeNowWatching.unsubscribe();
    };
  });
</script>

{#snippet toastActions()}
  {#if $nowPlaying}
    <NowPlayingContent nowPlaying={$nowPlaying} />
  {/if}
{/snippet}

<NavbarStateSetter toastActions={$nowPlaying ? toastActions : null} />
