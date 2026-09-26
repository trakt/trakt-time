import { goto } from '$app/navigation';

type ReplaceSearchParamParams = {
  url: URL;
  key: string;
  value: string;
};

export function replaceSearchParam(
  { url, key, value }: ReplaceSearchParamParams,
) {
  const next = new URL(url);
  next.searchParams.set(key, value);
  return goto(next, { replaceState: true, noScroll: true, keepFocus: true });
}
