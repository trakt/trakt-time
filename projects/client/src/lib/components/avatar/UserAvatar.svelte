<script lang="ts">
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';

  type Props = {
    name: string;
    src?: string | null;
    size?: 'xs' | 's' | 'm' | 'l';
  };

  const { name, src, size = 's' }: Props = $props();
</script>

<span class="user-avatar" data-size={size}>
  {#if src}
    <CrossOriginImage {src} alt="" animate={false} />
  {:else}
    <span class="user-avatar-initial" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  {/if}
</span>

<style lang="scss">
  .user-avatar {
    flex-shrink: 0;
    display: inline-flex;
    width: var(--ni-40);
    height: var(--ni-40);
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-floating-background);
    font-size: 1rem;

    &[data-size='xs'] {
      width: var(--ni-32);
      height: var(--ni-32);
      font-size: 0.75rem;
    }

    &[data-size='m'] {
      width: var(--ni-44);
      height: var(--ni-44);
      font-size: 1.125rem;
    }

    &[data-size='l'] {
      width: var(--ni-64);
      height: var(--ni-64);
      font-size: 1.5rem;
    }

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .user-avatar-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
</style>
