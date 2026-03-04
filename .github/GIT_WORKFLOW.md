# Git Workflow Guide

This project follows **GitHub Flow** — a simple, modern branching strategy used by global tech companies.

## Branching Strategy

```
main (always deployable)
  └── feature/101-login
  └── fix/102-auth-bug
  └── refactor/103-cleanup
```

- `main` is the **single source of truth** and must always be in a deployable state.
- All work happens in **short-lived feature branches** created from `main`.
- No `develop` or `release` branches.

## Workflow

### 1. Create a Branch

```bash
git switch main
git pull origin main
git switch -c feature/101-short-description
```

**Branch naming convention:**
| Prefix | Use case |
|---|---|
| `feature/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code refactoring |
| `docs/` | Documentation only |
| `chore/` | Build, CI, dependency updates |

### 2. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add user login API (#101)"
```

| Prefix | Description |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change (no feature/fix) |
| `docs:` | Documentation |
| `test:` | Tests |
| `chore:` | Build/CI/tooling |

### 3. Sync with Latest main (Rebase)

```bash
git fetch origin
git rebase origin/main
```

**If conflicts occur:**
```bash
# 1. Resolve conflicts in your editor
# 2. Stage resolved files
git add .
# 3. Continue rebase
git rebase --continue
```

### 4. Push & Create PR

```bash
# First push
git push -u origin feature/101-short-description

# After rebase (if already pushed before)
git push --force-with-lease
```

> ⚠️ **Always use `--force-with-lease`** instead of `--force`. It prevents overwriting others' work.

Then on GitHub:
- Create a Pull Request targeting `main`
- Fill out the PR template
- Request review
- Wait for CI to pass ✅

### 5. Merge

- Preferred strategy: **Squash and Merge** (keeps `main` history clean)
- Branch auto-deletes after merge (if configured)

### 6. Clean Up

```bash
git switch main
git pull origin main
git branch -d feature/101-short-description
```

## Recommended Git Config

```bash
# Safe force push (always use this instead of --force)
git config --global alias.pushf "push --force-with-lease"

# Rebase by default on pull
git config --global pull.rebase true

# Auto-prune deleted remote branches on fetch
git config --global fetch.prune true
```

## Branch Protection (Recommended)

Configure in GitHub → Settings → Branches → Branch protection rules for `main`:

- [x] Require a pull request before merging
- [x] Require status checks to pass (select `Build & Test`)
- [x] Require branches to be up to date before merging
- [x] Automatically delete head branches
