---
trigger: glob
globs: '**'
description: 'Conventional Commits, fixup workflow, and the trakt-time scope set.'
applyTo: '**'
---

# Commit Guidelines

## Conventional Commits

Every commit must follow the [Conventional Commits](https://www.conventionalcommits.org)
spec — `commitlint` enforces it on every PR. Subject line:

```
<type>(<scope>): <imperative description>
```

- **type** — `feat`, `fix`, `chore`, `docs`, `refactor`, `test`,
  `perf`, `build`, `ci`, `ops`, `style`, `revert`, `design`.
- **scope** — *area* of the codebase touched. The legal scope set is
  defined in [`commitlint.config.js`](../../commitlint.config.js); it
  is intentionally narrow.

Subject must be lowercase, no trailing period, ≤100 chars. Body
wrapped at ≤500 chars per line.

## Don't use `trakttime` as a scope

The fork's predecessor used `(trakttime)` as a catch-all scope. We
removed it from the legal scope set on purpose — it carried no signal
because every commit in the fork is "trakttime". Pick the most
specific area-of-codebase scope from `commitlint.config.js`:

| If the commit touches…                 | Scope to use         |
| -------------------------------------- | -------------------- |
| Comment lists / drawers / threads      | `comments`           |
| `BackBar`                              | `back-bar`           |
| `BottomNav`                            | `bottom-nav`         |
| Movie/show/episode summary pages       | `summary`            |
| Up-next / watchlist                    | `watchlist`          |
| Discover / popular / trending          | `discover`           |
| Profile / lists / people               | `profile`            |
| Layout shell, providers                | `layout`             |
| Design tokens, mode-aware CSS          | `theme`              |
| `--ni-*` / `--gap-*` / dim tokens      | `tokens`             |
| Trakt-time naming, manifest, branding  | `branding`           |
| Mass dead-code removal                 | `treeshake`          |
| Renamed app shell                      | `branding`           |
| Cloudflare / GitHub workflow           | (no scope, just `ci`)|

If you can't find a fit, add the new scope to `commitlint.config.js`
in the same PR — don't reach for a generic catch-all.

## Atomic, thematic commits

Prefer many small commits each telling one story over a single mega
commit. The branch lands as a sequence of thematic commits — every
commit should be reviewable on its own and should compile cleanly.

When you need to add a follow-up to an existing commit, use the fixup
workflow rather than a fresh `chore: address review feedback` commit.

## Fixup workflow

```sh
# 1. Make the follow-up change.
# 2. Stage just the bits that belong with the target commit.
git add path/to/file

# 3. Create a fixup commit pointing at the target SHA.
git commit --fixup=<sha-of-target-commit>

# 4. Squash it in.
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <base>
```

Use `<base>` of `upstream/main` for branches that haven't been merged,
or `HEAD~N` to limit the rewrite window when the branch is already on
`main`.

To rewrite a target commit's *message* without changing its tree:

```sh
git commit --allow-empty --fixup=reword:<sha>
# git editor opens — enter the new message
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <base>
```

## No `fixup!` commits ship

`pr_gate.yml` runs `vladjerca/no-fixups-action`. If a `fixup!` commit
makes it into a PR, the gate fails. Always autosquash before pushing.

## Co-authoring

When pairing with an AI assistant, append a `Co-Authored-By:` trailer
to the commit body so the contribution is attributed:

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Use the model that actually authored the change. Keep the trailer
inside the commit body, separated from the description by a blank
line.

## Quick checklist

- [ ] Subject ≤100 chars, lowercase, no trailing period.
- [ ] `<type>` is one of the legal types.
- [ ] `<scope>` (if any) comes from `commitlint.config.js` — never
      `trakttime`.
- [ ] Each commit compiles independently (`bun run check` passes).
- [ ] Follow-ups land via `git commit --fixup=<sha>` + autosquash, not
      as fresh "address feedback" commits.
- [ ] No `fixup!` left in the branch by the time the PR opens.
- [ ] `Co-Authored-By:` trailer added when AI assistance was used.
