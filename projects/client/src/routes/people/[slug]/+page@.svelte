<script lang="ts">
  import SeoHead from '$lib/features/seo/SeoHead.svelte';
  import { toPersonSeo } from '$lib/features/seo/media/toPersonSeo.ts';
  import type { PageProps } from './$types.ts';
  import { page } from '$app/state';
  import BackBar from '$lib/components/back-bar/BackBar.svelte';
  import CrossOriginImage from '$lib/features/image/components/CrossOriginImage.svelte';
  import LoadingIndicator from '$lib/components/icons/LoadingIndicator.svelte';
  import PosterSkeleton from '$lib/components/poster-card/PosterSkeleton.svelte';
  import { useQuery } from '$lib/features/query/useQuery.ts';
  import { peopleSummaryQuery } from '$lib/requests/queries/people/peopleSummaryQuery.ts';
  import { personShowCreditsQuery } from '$lib/requests/queries/people/personShowCreditsQuery.ts';
  import { personMovieCreditsQuery } from '$lib/requests/queries/people/personMovieCreditsQuery.ts';
  import { UrlBuilder } from '$lib/utils/url/UrlBuilder.ts';
  import * as m from '$lib/paraglide/messages.js';
  import PosterCard from '$lib/components/poster-card/PosterCard.svelte';

  const { data }: PageProps = $props();

  const slug = $derived(page.params.slug ?? '');

  const personQuery = $derived(useQuery(peopleSummaryQuery({ slug })));
  const person = $derived($personQuery.data ?? null);
  const isLoading = $derived($personQuery.isLoading && !person);

  const showCreditsQuery = $derived(useQuery(personShowCreditsQuery({ slug })));
  const movieCreditsQuery = $derived(useQuery(personMovieCreditsQuery({ slug })));

  const showCredits = $derived(
    ($showCreditsQuery.data?.get('acting') ?? []).filter((c) => c.type === 'cast'),
  );
  const movieCredits = $derived(
    ($movieCreditsQuery.data?.get('acting') ?? []).filter((c) => c.type === 'cast'),
  );

  const creditsLoading = $derived($showCreditsQuery.isLoading || $movieCreditsQuery.isLoading);
  const CREDITS_SKELETON_COUNT = 4;

  const birthdayLabel = $derived(
    person?.birthday
      ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(person.birthday)
      : null,
  );

  const ageLabel = $derived.by(() => {
    if (!person?.birthday) return null;
    const end = person.deathDate ?? new Date();
    const years = Math.floor((end.getTime() - person.birthday.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return person.deathDate ? `${years} (deceased)` : `${years}`;
  });

  const knownForLabel = $derived(
    person?.knownFor
      ? person.knownFor.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : null,
  );
</script>

<SeoHead
  {...toPersonSeo({
    person: person ?? data.crawlerPerson,
    url: `${page.url.origin}${page.url.pathname}`,
  })}
/>

<div class="person-page">
  <BackBar label={m.button_label_back()} variant="overlay" />

  {#if isLoading}
    <div class="loading-state">
      <LoadingIndicator />
    </div>
  {:else if person}
    <div class="person-hero">
      <div class="headshot-wrap">
        {#if person.headshot.url.medium}
          <CrossOriginImage src={person.headshot.url.medium} alt={person.name} />
        {:else}
          <div class="headshot-placeholder">{person.name.charAt(0)}</div>
        {/if}
      </div>
      <div class="person-identity">
        <h1 class="person-name">{person.name}</h1>
        {#if knownForLabel}
          <span class="known-for-badge">{knownForLabel}</span>
        {/if}
        <div class="person-meta">
          {#if birthdayLabel}<span>{birthdayLabel}</span>{/if}
          {#if ageLabel}<span>{ageLabel} yrs</span>{/if}
        </div>
      </div>
    </div>

    <div class="person-content">
      {#if person.biography}
        <section class="person-section">
          <h2 class="section-title">{m.header_biography()}</h2>
          <p class="biography">{person.biography}</p>
        </section>
      {/if}

      {#if creditsLoading}
        {#each [m.page_title_shows(), m.page_title_movies()] as heading (heading)}
          <section class="person-section" aria-hidden="true">
            <h2 class="section-title">{heading}</h2>
            <div class="poster-row">
              {#each Array(CREDITS_SKELETON_COUNT) as _, i (`ps-${i}`)}
                <PosterSkeleton />
              {/each}
            </div>
          </section>
        {/each}
      {:else}
      {#if showCredits.length > 0}
        <section class="person-section">
          <h2 class="section-title">{m.page_title_shows()}</h2>
          <div class="poster-row" role="list">
            {#each showCredits as credit, i (`${credit.key}-${i}`)}
              {#if credit.media.type === 'show'}
                <PosterCard
                  type="show"
                  href={UrlBuilder.show(credit.media.slug)}
                  id={credit.media.id}
                  title={credit.media.title}
                  posterUrl={credit.media.poster.url.thumb}
                />
              {/if}
            {/each}
          </div>
        </section>
      {/if}

      {#if movieCredits.length > 0}
        <section class="person-section">
          <h2 class="section-title">{m.page_title_movies()}</h2>
          <div class="poster-row" role="list">
            {#each movieCredits as credit, i (`${credit.key}-${i}`)}
              {#if credit.media.type === 'movie'}
                <PosterCard
                  type="movie"
                  href={UrlBuilder.movie(credit.media.slug)}
                  id={credit.media.id}
                  title={credit.media.title}
                  posterUrl={credit.media.poster.url.thumb}
                />
              {/if}
            {/each}
          </div>
        </section>
      {/if}
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '$style/scss/mixins/index' as *;

  .person-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: var(--color-background);
    padding-top: var(--ni-64);
    padding-bottom: var(--trakttime-bottom-nav-height);
  }

  .loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: var(--trakttime-loading-top);
  }

  .person-hero {
    display: flex;
    gap: var(--gap-m);
    align-items: center;
    padding: var(--gap-l) var(--gap-m) var(--gap-m);
  }

  .headshot-wrap {
    flex-shrink: 0;
    width: var(--ni-104);
    height: var(--ni-104);
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-card-background);

    :global(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .headshot-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  .person-identity {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
  }

  .person-name {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.2;
  }

  .known-for-badge {
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 500;
    padding: var(--gap-xxs) var(--gap-s);
    border-radius: var(--trakttime-radius-pill);
    background: var(--color-card-background);
    color: var(--color-text-primary);
    width: fit-content;
  }

  .person-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-xs);
    font-size: 0.875rem;
    color: var(--color-text-secondary);

    span {
      display: inline-flex;
      align-items: center;

      &:not(:last-child)::after {
        content: '·';
        margin-left: var(--gap-xs);
      }
    }
  }

  .person-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-l);
    padding: 0 0 var(--gap-l);
  }

  .person-section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-s);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    padding: 0 var(--gap-m);
  }

  .biography {
    font-size: 0.9375rem;
    color: var(--color-text-primary);
    line-height: 1.6;
    margin: 0;
    padding: 0 var(--gap-m);
  }


  .poster-row {
    @include scrollable-row;
    padding: 0 var(--gap-m);
  }
</style>
