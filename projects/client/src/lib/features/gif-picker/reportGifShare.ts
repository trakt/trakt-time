import { gifShareRequest } from '$lib/requests/queries/gifs/gifShareRequest.ts';

type ReportGifShareParams = {
  slug: string | Nil;
  customerId: string;
};

export function reportGifShare({ slug, customerId }: ReportGifShareParams) {
  if (!slug) return;

  gifShareRequest({ slug, customerId });
}
