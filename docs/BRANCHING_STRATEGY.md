# Branching Strategy

## Branch Overview

```
main          ← production-ready code, auto-deploys
  └── develop ← integration branch, preview deploys
       ├── feature/church-search    ← new features
       ├── fix/map-clustering       ← bug fixes
       └── chore/update-deps        ← maintenance
```

## Branch Types

### `main`
Production branch. Every commit here triggers a deployment. Protected by CI — all checks must pass. Only receives merges from `develop` via pull request.

### `develop`
Integration branch where feature work is merged and tested together. Preview deploys run here so you can verify before promoting to `main`.

### Feature / fix / chore branches
Created from `develop`. Named with a prefix and short description:
- `feature/` — new functionality
- `fix/` — bug fixes
- `chore/` — dependencies, refactoring, docs

## Workflow

1. **Start work:** branch off `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Commit often.** Write clear commit messages.

3. **Push and open a PR** targeting `develop`:
   ```bash
   git push -u origin feature/my-feature
   # Open PR on GitHub → base: develop
   ```

4. **CI runs automatically.** Lint, typecheck, and tests must pass.

5. **Merge to develop.** Use squash merge to keep history clean.

6. **Promote to main.** When `develop` is stable, open a PR from `develop` → `main`. This triggers the production deploy.

## Rollback

If a deploy to `main` causes issues:

- **Quick rollback:** Use GitHub Actions — run the Deploy workflow manually and enter the last good commit SHA in the `rollback_to` field.
- **Local rollback:** Run `./scripts/rollback.sh --last` to create a rollback branch from the previous release tag, then push and merge.
- **Specific version:** Run `./scripts/rollback.sh` to interactively pick from recent release tags.

Every deploy to `main` is automatically tagged (e.g., `v20260327-abc1234`) so you always have a known-good version to revert to.

## Release Tags

Deployments are auto-tagged by CI with the format `vYYYYMMDD-<short-sha>`. These tags serve as rollback targets and a deployment audit trail.

To see recent releases:
```bash
git tag --sort=-creatordate | head -10
```
