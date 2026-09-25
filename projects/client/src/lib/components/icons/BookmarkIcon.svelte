<script lang="ts">
  const { filled = false }: { filled?: boolean } = $props();
</script>

<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill={filled ? 'currentColor' : 'none'}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
  />
</svg>
