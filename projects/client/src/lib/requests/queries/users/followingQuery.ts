import { defineQuery } from '$lib/features/query/defineQuery.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { time } from '$lib/utils/timing/time.ts';
import { z } from 'zod';
import { mapToUserProfile } from '../../_internal/mapToUserProfile.ts';
import { toUniqueProfiles } from '../../_internal/toUniqueProfiles.ts';
import { InvalidateAction } from '../../models/InvalidateAction.ts';
import { UserProfileSchema } from '../../models/UserProfile.ts';

type FollowingParams = { slug: string } & ApiParams;

const followingRequest = (
  { fetch, slug }: FollowingParams,
) =>
  api({ fetch })
    .users
    .following({
      params: {
        id: slug,
      },
      query: {
        extended: 'full,vip,images' as 'full,vip',
      },
    });

export const followingQuery = defineQuery({
  key: 'following',
  invalidations: [InvalidateAction.User.Follow],
  dependencies: (
    params: FollowingParams,
  ) => [params.slug],
  request: followingRequest,
  mapper: (response) =>
    toUniqueProfiles(response.body.map(({ user }) => mapToUserProfile(user))),
  schema: z.array(UserProfileSchema),
  ttl: time.hours(3),
});
