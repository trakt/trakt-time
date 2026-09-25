import type { CommentResponse } from '@trakt/api';
import type { MediaComment } from '../models/MediaComment.ts';
import { mapToUserProfile } from './mapToUserProfile.ts';

function toCommentGif({ gif }: CommentResponse) {
  if (!gif) return null;

  const { url, width, height } = gif;

  return {
    url,
    size: width && height ? { width, height } : null,
  };
}

export function mapToMediaComment(
  commentResponse: CommentResponse,
): MediaComment {
  return {
    id: commentResponse.id,
    key: `comment-${commentResponse.id}`,
    parentId: commentResponse.parent_id,
    createdAt: new Date(commentResponse.created_at),
    updatedAt: new Date(commentResponse.updated_at),
    comment: commentResponse.comment,
    gif: toCommentGif(commentResponse),
    isSpoiler: commentResponse.spoiler,
    isReview: commentResponse.review,
    replyCount: commentResponse.replies,
    likeCount: commentResponse.likes,
    user: {
      ...mapToUserProfile(commentResponse.user),
      stats: {
        rating: commentResponse.user_stats.rating,
        playCount: commentResponse.user_stats.play_count,
        completedCount: commentResponse.user_stats.completed_count,
      },
    },
  };
}
