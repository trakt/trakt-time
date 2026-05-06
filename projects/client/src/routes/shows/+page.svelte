<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  if (browser) {
    goto('/shows/watchlist', { replaceState: true });
  }
</script>
