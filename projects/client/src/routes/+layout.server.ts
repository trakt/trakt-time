import type { OidcAuthToken } from '$lib/features/auth/models/OidcAuthToken.ts';
import { isCrawlerRequest } from '$lib/features/seo/isCrawlerRequest.ts';
import { getDeviceType } from '$lib/utils/devices/getDeviceType.ts';
import type { LayoutServerLoad } from '$types/$types.d.ts';

const getAuth = (auth: Nil | OidcAuthToken) => {
  if (!auth) return { token: null, expiresAt: null, isAuthorized: false };

  return {
    token: auth.token,
    expiresAt: auth.expiresAt,
    isAuthorized: true,
  };
};

export const load: LayoutServerLoad = ({ request, locals }) => {
  const userAgent = request.headers.get('user-agent');

  return {
    theme: locals.theme,
    oidcAuth: getAuth(locals.oidcAuth),
    isLegitimateBot: locals.isLegitimateBot,
    isCrawler: isCrawlerRequest({
      userAgent,
      isLegitimateBot: locals.isLegitimateBot,
    }),
    device: getDeviceType(userAgent),
    typesense: locals.typesense,
  };
};
