<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  if (browser) {
    goto('/movies/watchlist', { replaceState: true });
  }
</script>
