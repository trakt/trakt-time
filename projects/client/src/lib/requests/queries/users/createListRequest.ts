import { api, type ApiParams } from '$lib/requests/api.ts';

type CreateListParams = {
  name: string;
  description?: string;
  privacy?: 'private' | 'friends' | 'public';
} & ApiParams;

export async function createListRequest(
  { name, description, privacy = 'private', fetch }: CreateListParams,
): Promise<{ id: number; slug: string } | null> {
  const { status, body } = await api({ fetch })
    .users
    .lists
    .create({
      params: { id: 'me' },
      body: {
        name,
        description,
        privacy,
      },
    });

  if (status !== 201) return null;
  return { id: body.ids.trakt, slug: body.ids.slug };
}
