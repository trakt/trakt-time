import type { OidcAuthToken } from '$lib/features/auth/models/OidcAuthToken.ts';
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

export const load: LayoutServerLoad = ({ request, locals }) => ({
  theme: locals.theme,
  oidcAuth: getAuth(locals.oidcAuth),
  isLegitimateBot: locals.isLegitimateBot,
  device: getDeviceType(request.headers.get('user-agent')),
  typesense: locals.typesense,
});
