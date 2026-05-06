import { api, type ApiParams } from '$lib/requests/api.ts';
import { error } from '@sveltejs/kit';

type DeleteCommentParams = { id: number } & ApiParams;

export function deleteCommentRequest(
  { fetch, id }: DeleteCommentParams,
): Promise<true> {
  return api({ fetch })
    .comments
    .delete({
      params: { id: `${id}` },
    })
    .then((response) => {
      if (response.status !== 204) {
        throw error(response.status);
      }
      return true as const;
    });
}
