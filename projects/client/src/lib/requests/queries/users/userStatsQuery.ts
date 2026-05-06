import { defineQuery } from '$lib/features/query/defineQuery.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { time } from '$lib/utils/timing/time.ts';
import { z } from 'zod';

type UserStatsParams = { slug: string } & ApiParams;

const SimpleStatsSchema = z.object({
  ratings: z.number(),
  comments: z.number(),
});

const ExtendedStatsSchema = SimpleStatsSchema.extend({
  watched: z.number(),
  collected: z.number(),
});

const FullStatsSchema = ExtendedStatsSchema.extend({
  plays: z.number(),
  minutes: z.number(),
});

export const UserStatsSchema = z.object({
  shows: ExtendedStatsSchema,
  movies: FullStatsSchema,
  episodes: FullStatsSchema,
  network: z.object({
    friends: z.number(),
    followers: z.number(),
    following: z.number(),
  }),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

const userStatsRequest = ({ fetch, slug }: UserStatsParams) =>
  api({ fetch })
    .users
    .stats({
      params: { id: slug },
    });

export const userStatsQuery = defineQuery({
  key: 'userStats',
  invalidations: [],
  dependencies: (params) => [params.slug],
  request: userStatsRequest,
  mapper: (response) => response.body,
  schema: UserStatsSchema,
  ttl: time.hours(3),
});
