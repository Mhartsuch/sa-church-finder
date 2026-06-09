# Branching Strategy

## Branch Overview

```
main          ← production-ready code, auto-deploys via Render
  ├── feature/church-search    ← new features
  ├── fix/map-clustering       ← bug fixes
  └── chore/update-deps        ← maintenance
```

There is no long-lived integration branch. Short-lived branches come off
`main` and merge straight back into `main` once CI is green.

## Branch Types

### `main`

Production branch. Every commit here is deployable; Render auto-deploys from
it. Protected by CI — lint, typecheck, tests, and build must pass.

### Feature / fix / chore branches

Created from `main`. Named with a prefix and short description:

- `feature/` — new functionality
- `fix/` — bug fixes
- `chore/` — dependencies, refactoring, docs

(Agent sessions may also use the `claude/<description>-<id>` naming that the
tooling generates; the lifecycle is the same.)

## Workflow

1. **Start work:** branch off `main`

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature
   ```

2. **Commit often.** Use Conventional Commits (`feat:`, `fix:`, `docs:`, …).

3. **Push and open a PR** targeting `main`:

   ```bash
   git push -u origin feature/my-feature
   # Open PR on GitHub → base: main
   ```

4. **CI runs automatically.** Lint, typecheck, tests, and build must pass.

5. **Merge to main.** Render picks up the merge and deploys.

6. **Delete the branch** (local and remote) once its work is on `main`:

   ```bash
   git branch -d feature/my-feature
   git push origin --delete feature/my-feature
   ```

## Rollback

If a deploy to `main` causes issues:

- **Quick rollback:** Use GitHub Actions — run the Deploy workflow manually and enter the last good commit SHA in the `rollback_to` field.
- **Local rollback:** Run `./scripts/rollback.sh --last` to create a rollback branch from the previous release tag, then push and merge.
- **Specific version:** Run `./scripts/rollback.sh` to interactively pick from recent release tags.

## Release Tags

Manual deploy runs are tagged with the format `vYYYYMMDD-<short-sha>`. These
tags serve as rollback targets and a deployment audit trail.

To see recent releases:

```bash
git tag --sort=-creatordate | head -10
```
