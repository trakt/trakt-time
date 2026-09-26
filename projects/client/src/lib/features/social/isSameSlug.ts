export function isSameSlug(a: string | null | undefined, b: string): boolean {
  return a?.toLowerCase() === b.toLowerCase();
}
