export type ReactionsDistributionProps<T extends string> = {
  reactions: ReadonlyArray<T>;
  distribution?: Readonly<Partial<Record<T, number>>>;
  current: ReadonlyArray<T>;
  isLoading: boolean;
  title: string;
  pageSize: number;
  limit?: number;
  toOption: (reaction: T) => { code: string; label: string };
  onRemove?: (reaction: T) => void;
  onAdd?: (reaction: T) => void;
};
