import { defineInfiniteQuery } from '$lib/features/query/defineQuery.ts';
import { mapToMediaComment } from '$lib/requests/_internal/mapToMediaComment.ts';
import { api, type ApiParams } from '$lib/requests/api.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { MediaCommentSchema } from '$lib/requests/models/MediaComment.ts';
import { time } from '$lib/utils/timing/time.ts';
import { extractPageMeta } from '../../_internal/extractPageMeta.ts';
import { PaginatableSchemaFactory } from '../../models/Paginatable.ts';
import type { PaginationParams } from '../../models/PaginationParams.ts';

type CommentRepliesParams = { id: number } & ApiParams & PaginationParams;

const commentRepliesRequest = (
  { fetch, id, limit, page }: CommentRepliesParams,
) =>
  api({ fetch })
    .comments
    .replies({
      params: { id: `${id}` },
      query: {
        extended: 'images',
        limit,
        page,
      },
    });

export const commentRepliesQuery = defineInfiniteQuery({
  key: 'commentReplies',
  invalidations: [
    InvalidateAction.Comment.Reply('movie'),
    InvalidateAction.Comment.Reply('show'),
    InvalidateAction.Comment.Reply('episode'),
  ],
  dependencies: (params) => [params.id, params.page, params.limit],
  request: commentRepliesRequest,
  mapper: (response) => ({
    entries: response.body.map(mapToMediaComment),
    page: extractPageMeta(response.headers),
  }),
  schema: PaginatableSchemaFactory(MediaCommentSchema),
  ttl: time.minutes(5),
});
