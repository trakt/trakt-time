# Infrastructure

trakt-time runs on a single Cloudflare Worker built with `@sveltejs/adapter-cloudflare`. CI builds and deploys on push to `main`; everything below is what you need to set that up (or to deploy ad-hoc from your machine).

## Cloudflare account setup

You only need to do these steps once per Cloudflare account / fork.

1. **Create the Worker.** Sign in to [dash.cloudflare.com](https://dash.cloudflare.com), grab your account id, then either:
   - Run `npx wrangler deploy` from `projects/client` and let wrangler create the Worker named `trakt-time` automatically, **or**
   - Pre-create a Worker named `trakt-time` in the dashboard so the first deploy lands in the slot you want.

   The Worker name comes from `projects/client/wrangler.jsonc` (`"name": "trakt-time"`).

2. **Set Worker secrets.** From `projects/client`, with `wrangler login` done:

   ```sh
   echo "$TRAKT_CLIENT_ID"     | npx wrangler secret put TRAKT_CLIENT_ID
   echo "$TRAKT_CLIENT_SECRET" | npx wrangler secret put TRAKT_CLIENT_SECRET
   echo "$TYPESENSE_CLIENT_KEY"| npx wrangler secret put TYPESENSE_CLIENT_KEY
   ```

   The `TYPESENSE_SERVER` value is committed in `wrangler.jsonc` (`vars`) and points at the public Trakt search endpoint by default.

3. **Get a deploy API token.** In the Cloudflare dashboard, [create an API token](https://dash.cloudflare.com/profile/api-tokens) with the **Edit Cloudflare Workers** template scoped to your account. Save the token — you'll add it to GitHub next.

## GitHub repository setup

Add these secrets under **Settings → Secrets and variables → Actions**:

| Secret                  | What to set it to                                          |
| ----------------------- | ---------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | The token from step 3 above                                |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account id (visible in the dashboard URL) |
| `TRAKT_CLIENT_ID`       | Trakt application client id used for the build             |

That's everything CI needs. Subsequent pushes to `main` build the client and deploy via `cloudflare/wrangler-action`.

## Local development

You almost never need wrangler for day-to-day work — `deno task client:dev` runs Vite directly with hot reload. Wrangler is only needed when you want to test the worker pipeline (secrets resolution, edge runtime semantics, etc.).

### Vite dev (recommended)

```sh
deno task client:dev          # private Trakt env (default)
deno task client:dev:contrib  # public Trakt env
```

### Worker preview

If you do want to preview the actual Worker locally:

```sh
cd projects/client
deno task build
npx wrangler dev   # or `bunx wrangler dev`
```

> Wrangler can't run under Deno yet ([deno#26349](https://github.com/denoland/deno/issues/26349)), so use `npm` or `bun` for the wrangler commands.

### Ad-hoc deploy from your machine

```sh
cd projects/client
deno task build
npx wrangler deploy
```

Prefer letting CI do this. Local deploys are useful for staging branches under
[Cloudflare preview deployments](https://developers.cloudflare.com/workers/configuration/previews/).

## Regenerating PWA install-prompt screenshots

The `static/pwa/screenshots/` set is what the Android install prompt shows on supported browsers. Whenever the UI shifts enough that the existing screenshots look stale, regenerate them locally:

```sh
# terminal 1
deno task client:dev

# terminal 2 (once vite reports ready)
deno task client:pwa:screenshots
```

The script (`projects/client/.scripts/pwa-screenshots.ts`) uses Playwright's bundled Chromium. It captures three unauth-friendly surfaces — `/discover`, `/movies/the-matrix-1999`, `/shows/breaking-bad` — at portrait (1556×3476) and wide (2596×1804) resolutions, and writes webp into `static/pwa/screenshots/`. ImageMagick (`magick`) is required for the PNG → webp step.

Override the dev server URL with `PWA_SCREENSHOT_URL=https://<...> deno task client:pwa:screenshots` if you want to capture against preview / a deployed worker. Don't run from CI — it would double pipeline time and the screenshots only churn when the UI does.

## Required environment variables

### Build time

- **`TRAKT_CLIENT_ID`** — baked into the bundle so the client can call the Trakt OAuth endpoints.

### Worker runtime (set as wrangler secrets, not env vars)

- **`TRAKT_CLIENT_ID`** — also set as a Worker secret because the worker uses it server-side.
- **`TRAKT_CLIENT_SECRET`** — completes the OAuth handshake server-side.
- **`TYPESENSE_CLIENT_KEY`** — used to mint scoped Typesense search keys.

### Worker bindings (configured in `wrangler.jsonc`)

- **`CF_VERSION_METADATA`** — populated by Cloudflare automatically, used to surface the deployed git sha in the UI.
- **`ASSETS`** — static asset binding wired to `.svelte-kit/cloudflare`.

### Typesense

- **`TYPESENSE_CLIENT_KEY`** (secret) — admin key for the Typesense server. The worker uses it to issue **scoped** search keys per request (it never reaches the browser).
- **`TYPESENSE_SERVER`** (var, in `wrangler.jsonc`) — URL of the Typesense instance. Defaults to the public Trakt search server; override per environment if you stand up your own.
