export function toShareImageUrl(url: string): string {
  return url.replace(/\.(jpe?g|png)\.webp$/i, '.$1');
}
