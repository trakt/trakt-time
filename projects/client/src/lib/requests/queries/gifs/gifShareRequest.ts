import { klipyUrl } from './_internal/klipyUrl.ts';

type GifShareParams = {
  slug: string;
  customerId: string;
  fetch?: typeof fetch;
};

export function gifShareRequest({
  slug,
  customerId,
  fetch = globalThis.fetch,
}: GifShareParams): Promise<void> {
  return fetch(klipyUrl(`gifs/share/${encodeURIComponent(slug)}`), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId }),
  })
    .then(() => undefined)
    .catch(() => undefined);
}
