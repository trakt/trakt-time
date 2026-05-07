import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { createListRequest } from '$lib/requests/queries/users/createListRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject } from 'rxjs';

export function useCreateList() {
  const isCreating = new BehaviorSubject(false);
  const { invalidate } = useInvalidator();

  const createList = async (
    name: string,
  ): Promise<{ id: number; slug: string } | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    isCreating.next(true);
    try {
      const result = await createListRequest({ name: trimmed });
      if (result) {
        await invalidate(InvalidateAction.List.Created);
      }
      return result;
    } finally {
      isCreating.next(false);
    }
  };

  return { createList, isCreating };
}
