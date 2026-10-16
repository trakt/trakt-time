import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import SentimentContent from './SentimentContent.svelte';

describe('SentimentContent', () => {
  it('should link people mentioned in the analysis and highlight', () => {
    render(SentimentContent, {
      props: {
        sentiment: {
          analysis: 'Led by [Tom Hanks](/people/tom-hanks).',
          highlight: '[Meg Ryan](/people/meg-ryan) shines.',
          aspect: { pros: [], cons: [] },
        },
      },
    });

    expect(screen.getByRole('link', { name: 'Tom Hanks' })).toHaveAttribute(
      'href',
      '/people/tom-hanks',
    );
    expect(screen.getByRole('link', { name: 'Meg Ryan' })).toHaveAttribute(
      'href',
      '/people/meg-ryan',
    );
  });
});
