export function compact<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) =>
      value !== undefined && value !== null && value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ),
  ) as T;
}
