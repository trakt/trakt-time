import type { Snippet } from 'svelte';

export type ReactionsPopupProps = {
  trigger: Snippet<[toggle: () => void, isOpened: boolean]>;
  children: Snippet<[close: () => void]>;
  reserve: number;
  onOpenChange?: (isOpened: boolean) => void;
};
