export function toIsoDate(date: Nil | Date): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}
