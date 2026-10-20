import type { ReactionsPopoverProps } from './ReactionsPopoverProps.ts';

export type ReactionsPopoverContentProps = Omit<
  ReactionsPopoverProps,
  'trigger' | 'onOpenChange'
> & { onMore?: () => void };
