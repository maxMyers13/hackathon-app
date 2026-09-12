---
name: worktree-pr
description: Package a change (uncommitted work, or a task you're about to start) into an isolated git worktree, verify it builds, and open a clean PR off main — without touching whatever else is going on in your main checkout. Use whenever you're about to have an AI agent make changes, when your main checkout is dirty and something in it needs to ship on its own, or when you just want your local branch state to stay predictable.
---

# Worktree PR

## Why this exists

When an AI agent (or you, moving fast) edits files directly in your main checkout, a few things go wrong at hackathon speed:

- **Unrelated work gets tangled.** You ask for one fix, the agent's diff mixes in changes from whatever you were mid-way through, and now `git status` is a mess of things that don't belong together.
- **You lose the ability to bail.** If an agent's change is bad, "just undo it" means digging through a dirty working tree instead of deleting a branch.
- **Nothing gets verified before it lands.** Code that "looks right" and code that actually builds and type-checks are different things — a change should prove itself before it's on `main`.
- **Parallel work collides.** If you (or two agents) are touching the repo at once, one main checkout means one of you is always stepping on the other's half-finished edits.

A `git worktree` is a second, independent working copy of the same repo — its own directory, its own checked-out branch, but sharing the same `.git` history. Doing work there means your main checkout's branch and file state never move while the work happens. If the change is bad, delete the worktree and nothing was ever at risk. If it's good, it becomes a normal PR you (or a teammate) review before merging.

This is the same discipline good engineering teams use for any change that should be reviewable and revertible — worktrees just make it cheap enough to do for every change, not just the big ones.

## Steps

1. **Branch off main, in a new worktree — not in place.**
   ```bash
   git fetch origin main
   git worktree add /tmp/wt-<slug> -b <feat|fix>/<slug> origin/main
   ```
   `<slug>` is a short kebab-case description of the change (`add-dark-mode`, `fix-login-redirect`).

2. **Do the work in `/tmp/wt-<slug>`, not in your main checkout.** Point your editor/agent at that path. Your main checkout stays exactly as you left it the whole time.

3. **Install dependencies in the worktree.** Don't symlink `node_modules` from your main checkout — Next.js's Turbopack build fails on a symlinked `node_modules` that points outside the project directory (`Symlink [project]/node_modules is invalid, it points out of the filesystem root`). A real install is fast enough:
   ```bash
   cd /tmp/wt-<slug> && npm install
   ```
   Copy your `.env.local` into the worktree too (`cp <main-checkout>/.env.local .`) — it's gitignored, so it won't come from the branch.

4. **Verify before you commit.** At minimum:
   ```bash
   npx tsc --noEmit
   npx next build
   ```
   If the change touches the database, run `npx supabase db push` (or `config push`) from the worktree and confirm it applies cleanly. If it touches UI, run `npm run dev` and actually look at the page.

5. **Commit, push, and open the PR.**
   ```bash
   git add -A
   git commit -m "Short summary of what changed and why"
   git push -u origin <feat|fix>/<slug>
   gh pr create --base main --title "..." --body "## Summary\n...\n## Test plan\n- [x] ..."
   ```

6. **Get it reviewed.** For a hackathon team, this can just be a teammate reading the diff — or ask Claude Code itself with `/code-review` against the PR. If your repo has an automated review bot configured (e.g. CodeRabbit, Greptile), wait for it to comment before merging, and address what it finds.

7. **Merge, then clean up.**
   ```bash
   gh pr merge <n> --squash --delete-branch
   cd <main-checkout> && git checkout main && git pull origin main
   git worktree remove /tmp/wt-<slug> --force
   ```
   Your main checkout now has the change, fast-forwarded, with no merge conflicts to resolve — because it never diverged from `main` in the first place.

## When to skip this

For truly trivial edits you're making yourself and will glance at before committing anyway (typo fixes, a config value), this is overkill — just edit and commit normally. Reach for a worktree when: an agent is doing the editing, the change is non-trivial, or you want a clean revert story if it turns out wrong.
