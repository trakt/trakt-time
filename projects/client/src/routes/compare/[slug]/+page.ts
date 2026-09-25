import { error } from '@sveltejs/kit';
import { findCompetitor } from '$lib/features/compare/competitors.ts';
import type { PageLoad } from './$types.ts';

export const load: PageLoad = ({ params }) => {
  const competitor = findCompetitor(params.slug);
  if (!competitor) error(404);

  return { competitor };
};
