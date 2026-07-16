# trakt-time

<a href="https://github.com/Hobo-Ware/trakt-time/actions/workflows/ci_cd.yml"><img src="https://github.com/Hobo-Ware/trakt-time/actions/workflows/ci_cd.yml/badge.svg" /></a>

> **Note:** This is an experiment. We're rebuilding a Trakt client app with a
> mobile-first, TV Time-like feel. Started as an AI hackathon project, kept
> alive for fun and learning. It's not aiming to
> replace anything — just a sandbox.

---

**Open source, contributions welcome!** PRs of any size are encouraged. Bug
fixes, polish, new features, translations — dive in. See
[CONTRIBUTING.md](.github/CONTRIBUTING.md) for the details.

---

## What's in here

The repo is a [Deno workspace](https://docs.deno.com/runtime/fundamentals/workspaces/)
with one project today:

- **`projects/client`** — the SvelteKit frontend that talks to the Trakt API
  and renders the trakt-time UI. Deployed to a Cloudflare Worker.

## Getting started

You need [Deno](https://docs.deno.com/runtime/getting_started/installation/)
installed. Once you have it:

1. Clone the repository.
2. Install dependencies: `deno task install`
3. Start the dev server: `deno task client:dev`

### Trakt API credentials

You need a personal Trakt application to develop against:

1. Create one at [Trakt Settings → Applications](https://trakt.tv/oauth/applications).
2. Add these `Redirect URIs` (one per line):

   ```
   http://localhost:5173
   http://localhost:5173/callback
   http://localhost:4173
   http://localhost:4173/callback
   ```

3. Add the same values to `Javascript (cors) origins`.
4. Export the credentials before running tasks:

   ```sh
   export TRAKT_CLIENT_ID=...
   export TRAKT_CLIENT_SECRET=...
   ```

External contributors should use `deno task client:dev:contrib` so the dev
server points at the public Trakt environment instead of the private one.

> Port `5173` is for `vite dev`, `4173` is for `vite preview`.

## Workspace tasks

From the repo root:

| Task                       | What it does                          |
| -------------------------- | ------------------------------------- |
| `deno task install`        | Install dependencies                  |
| `deno task format`         | `deno fmt` + `deno lint --fix`        |
| `deno task client:dev`     | Run the client dev server             |
| `deno task client:dev:contrib` | Same, but against the public Trakt API |

From `projects/client/`:

| Task                  | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `deno task check`     | `svelte-kit sync` + `svelte-check`              |
| `deno task test:unit` | Run Vitest                                      |
| `deno task build`     | Build for Cloudflare Workers (`adapter-cloudflare`) |
| `deno task preview`   | Serve the production build locally              |

## Build & local preview

```sh
cd projects/client
deno task build
deno task preview
```

If you want a real Cloudflare Worker preview locally (instead of `vite preview`):

```sh
cd projects/client
deno task build
npx wrangler dev   # or `bunx wrangler dev`
```

> Wrangler currently can't run under Deno because Deno doesn't yet support Node
> VM modules ([deno#26349](https://github.com/denoland/deno/issues/26349)). Use
> `npm` or `bun` for the wrangler step.

## Deploy

The Cloudflare Worker is deployed from CI on every push to `main` (see
`.github/workflows/ci_cd.yml`). For ad-hoc deploys from your machine:

```sh
cd projects/client
deno task build
npx wrangler deploy
```

You'll need `wrangler login` once and the right secrets configured (see
[INFRASTRUCTURE.md](INFRASTRUCTURE.md)).

## Updating dependencies

We use [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates)
because the client is a `package.json` project living inside a Deno workspace.

```sh
deno install -g --allow-all -n ncu npm:npm-check-updates
```

For minor bumps:

```sh
ncu --dep prod -t minor       # check
ncu --dep prod -t minor -u    # update
ncu --dep dev -t minor
ncu --dep dev -t minor -u
```

For majors: `ncu --dep prod -t latest`, do them one at a time, build, fix
breakage, commit.

## Tech stack & acknowledgements

trakt-time stands on the shoulders of:

<a href="https://svelte.dev/"><img src="https://img.shields.io/badge/Built_with-SvelteKit-FF3E00?logo=svelte&logoColor=white" alt="Built with SvelteKit" /></a>
<a href="https://www.cloudflare.com/developer-platform/workers/"><img src="https://img.shields.io/badge/Hosted_on-Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Hosted on Cloudflare Workers" /></a>

Built on top of the original [trakt/trakt-web](https://github.com/trakt/trakt-web)
codebase, which we forked and reshaped for this experiment. Huge thanks to the
upstream maintainers.

For infrastructure-flavored details (env vars, wrangler secrets, Typesense,
etc.), see [INFRASTRUCTURE.md](INFRASTRUCTURE.md).
