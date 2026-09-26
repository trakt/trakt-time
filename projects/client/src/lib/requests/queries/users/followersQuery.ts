import { defineQuery } from '$lib/features/query/defineQuery.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { time } from '$lib/utils/timing/time.ts';
import { z } from 'zod';
import { mapToUserProfile } from '../../_internal/mapToUserProfile.ts';
import { toUniqueProfiles } from '../../_internal/toUniqueProfiles.ts';
import { InvalidateAction } from '../../models/InvalidateAction.ts';
import { UserProfileSchema } from '../../models/UserProfile.ts';

type FollowersParams = { slug: string } & ApiParams;

const followersRequest = (
  { fetch, slug }: FollowersParams,
) =>
  api({ fetch })
    .users
    .followers({
      params: {
        id: slug,
      },
      query: {
        extended: 'full,vip,images' as 'full,vip',
      },
    });

export const followersQuery = defineQuery({
  key: 'followers',
  invalidations: [InvalidateAction.User.Follow],
  dependencies: (
    params: FollowersParams,
  ) => [params.slug],
  request: followersRequest,
  mapper: (response) =>
    toUniqueProfiles(response.body.map(({ user }) => mapToUserProfile(user))),
  schema: z.array(UserProfileSchema),
  ttl: time.hours(3),
});
