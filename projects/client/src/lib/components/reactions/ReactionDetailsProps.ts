export type ReactionDetailsProps<T extends string> = {
  reaction: T;
  code: string;
  label: string;
  value: string;
  isCurrent: boolean;
  onRemove?: (reaction: T) => void;
  onAdd?: (reaction: T) => void;
};
