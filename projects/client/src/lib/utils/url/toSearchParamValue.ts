export function toSearchParamValue<T extends string>(
  { value, options, fallback }: {
    value: string | null;
    options: ReadonlyArray<T>;
    fallback: NoInfer<T>;
  },
): T {
  return options.find((option) => option === value) ?? fallback;
}
