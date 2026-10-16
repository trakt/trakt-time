import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import TriviaCard from './TriviaCard.svelte';

describe('TriviaCard', () => {
  it('should link people mentioned in the trivia', () => {
    render(TriviaCard, {
      props: {
        trivia: {
          text: '[Tom Hanks](/people/tom-hanks) improvised it.',
          isSpoiler: false,
        },
      },
    });

    expect(screen.getByRole('link', { name: 'Tom Hanks' })).toHaveAttribute(
      'href',
      '/people/tom-hanks',
    );
  });
});
