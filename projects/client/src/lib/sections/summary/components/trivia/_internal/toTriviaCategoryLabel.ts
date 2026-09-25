import * as m from '$lib/paraglide/messages.js';
import type { TriviaCategory } from '$lib/requests/models/MediaTrivia.ts';

export function toTriviaCategoryLabel(category: TriviaCategory): string {
  switch (category) {
    case 'bts':
      return m.trivia_category_bts();
    case 'cast_n_crew':
      return m.trivia_category_cast_n_crew();
    case 'story_n_themes':
      return m.trivia_category_story_n_themes();
    case 'impact_n_legacy':
      return m.trivia_category_impact_n_legacy();
    case 'real_world_connections':
      return m.trivia_category_real_world_connections();
  }
}
