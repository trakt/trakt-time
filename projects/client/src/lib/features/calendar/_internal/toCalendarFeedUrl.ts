import type { MediaType } from '$lib/requests/models/MediaType.ts';
import { buildParamString } from '$lib/utils/url/buildParamString.ts';

const FEED_TOKEN_PARAM = 'slurm';

type ToCalendarFeedUrlParams = {
  origin: HttpsUrl;
  token: string;
  mode: MediaType;
};

export function toCalendarFeedUrl(
  { origin, token, mode }: ToCalendarFeedUrlParams,
): { https: string; webcal: string } {
  const path = mode === 'movie' ? 'my/movies' : 'my/shows';
  const query = buildParamString({ [FEED_TOKEN_PARAM]: token });
  const https = `${origin}/calendars/${path}.ics${query}`;

  return { https, webcal: https.replace(/^https?:/, 'webcal:') };
}
