---
trigger: glob
globs: 'projects/client/src/**'
description: 'Performance rules for global listeners, query streams, route loads, images and lazy chunks, with the file that shows each one.'
applyTo: 'projects/client/src/**'
---

# Performance Guidelines

Rules learned from measured passes. Each one names the reason and a file that
shows it. Read before touching listeners, rxjs plumbing over queries, route
loads, images or imports of heavy libraries.

## Listeners

- **Register global listeners once, and remove the same function you added.**
  `fn.bind(this)` makes a new function each call, so a remove with a fresh bind
  never matches and the next register adds a second window listener. See
  `lib/utils/events/GlobalEventBus.ts`.
- **Attach per-instance global handlers only when a caller uses them.** A
  component that every screen renders must not register window handlers for an
  event nobody listens to. See `lib/components/buttons/Button.svelte`
  (`clickOutside` attaches only when `onclickoutside` is passed).
- **Close the old connection before opening a new one.** A socket, observer or
  subscription created per token or prop change must drop the previous one. See
  `lib/features/websocket/createConnection.ts`.
- **Pause timers nobody can see.** Stop intervals while `document.hidden` or
  while the element is off screen (one `IntersectionObserver`). See
  `lib/sections/discover/DiscoverSpotlight.svelte`.

## Query streams

- **Project to `.data` and add `distinctUntilChanged()` before expensive work.**
  A query observable emits a new result on every fetch-status change with the
  same `data` reference, so maps, Sets and dedupes downstream rebuild for
  nothing. See `lib/features/auth/stores/useUser.ts`,
  `lib/sections/lists/stores/usePaginatedListQuery.ts`.
- **Keep inactive queries for 30 minutes** (`gcTime` in `routes/+layout.ts`), so
  a revisit reads memory instead of IndexedDB. Sweep the persister when the
  browser is idle, not during the layout load.
- **Skip requests the state already answers.** Do not call a remove endpoint
  when the user has nothing to remove. See
  `lib/features/reactions/useCommentReaction.ts`.

## Navigation

- **Start the page's main query on tap.** `app.html` sets
  `data-sveltekit-preload-data="tap"`, so a universal `+page.ts` runs on tap
  down. Prefetch with the exact query the page's `useQuery` uses (same key) and
  never await it. When a `+page.server.ts` sits next to it, return its `data`
  unchanged, or the crawler props are lost. See `routes/movies/[slug]/+page.ts`.

## Images and chunks

- **Give the always-visible main image eager loading and high fetch priority.**
  Do not do this for images hidden at some widths: they still download. See
  `routes/people/[slug]/+page@.svelte`.
- **Do not put `content-visibility: auto` on every image.** The relevance
  tracking costs more per image than it saves. See
  `lib/features/image/components/CrossOriginImage.svelte`.
- **Load heavy client libraries on first use.** `lib/requests/search/lookup.ts`
  imports the Typesense client dynamically, which took 121 KB raw off the
  Discover page's code.
