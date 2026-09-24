import type { StreamingServiceOptions } from '$lib/requests/models/StreamingServiceOptions.ts';
import type { StreamingSource } from '$lib/requests/models/StreamingSource.ts';

export type WhereToWatchService = {
  key: string;
  source: string;
  name: string;
  link: string;
  logoUrl: string | null;
  color: string | null;
};

type ToWhereToWatchServicesParams = {
  options: StreamingServiceOptions;
  sources: ReadonlyArray<StreamingSource>;
};

export function toWhereToWatchServices(
  { options, sources }: ToWhereToWatchServicesParams,
): WhereToWatchService[] {
  const sourcesByKey = new Map(
    sources.map((source) => [source.source, source]),
  );
  const offers = [...options.streaming, ...options.free, ...options.onDemand];

  return offers
    .filter((offer, index) =>
      offers.findIndex((other) => other.source === offer.source) === index
    )
    .map((offer) => {
      const source = sourcesByKey.get(offer.source);

      return {
        key: offer.key,
        source: offer.source,
        name: source?.name ?? offer.source,
        link: offer.link,
        logoUrl: source?.logoUrl ?? null,
        color: source?.color ?? null,
      };
    });
}
