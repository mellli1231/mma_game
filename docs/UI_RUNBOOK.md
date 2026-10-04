# UI runbook (unattended run)

Owner: Person A (Min), who is asleep. Do not ask questions. Decide, log it, continue.
Read docs/DESIGN.md completely before step 0.

## Overrides for this run
These replace any conflicting line in CLAUDE.md and docs/TEAM.md:
- The "plan first and wait for approval" rule is skipped. This work is pre-approved.
- Person A temporarily owns front-end STYLING for the whole app, including `src/index.css`, `src/app/components/**`, `src/app/motion.ts`, `public/**`, and the page files that belong to B and C. Styling only: class names, wrapper elements, CSS, the app name.
- Still forbidden: logic, component props (docs/CONTRACTS.md), routes and guards, `src/types.ts`, `src/data/**`, `src/engine/**`, `src/background/**`, `src/platform/**`, `src/dev/**`, `tests/**`, `package.json`, `package-lock.json`, `vite.config.ts`, `SPEC.md`.
- No new dependencies. Do not run `npm install`.
- Never push, merge, rebase or force anything. Commits stay local on branch `a/ui-skin`.
- Commit with explicit paths: `git add <paths>` then `git commit -m "[A] ui: <step>"`.

## Loop rules
- After every step run `npm run verify`.
  - Pass: commit, append to `docs/UI_PROGRESS.md`, go to the next step.
  - Fail: fix it (at most 3 attempts). If it still fails, run `git checkout -- .` to discard only this step's uncommitted work, log the reason in `docs/UI_PROGRESS.md`, and STOP.
- If a needed edit is blocked by a permission rule, skip that item, log it, continue.
- Resume: at the start read `docs/UI_PROGRESS.md` and skip steps already marked done.
- Every step must leave the app building and looking consistent. That is why tokens come first: pages you have not restyled yet still pick up the new values.

## Steps

### 0. Preflight
- `git branch --show-current` must print `a/ui-skin`, otherwise STOP.
- `git status --short` should show only the kit files: `docs/DESIGN.md`, `docs/UI_RUNBOOK.md`, `public/icon16.png`, `public/icon48.png`, `public/icon128.png`, `public/logo.png`, `public/assets/backgrounds/`.
- `npm run verify` must pass before you change anything, otherwise STOP.

### 1. Kit commit
- Create `docs/UI_PROGRESS.md` with a title and a list of steps with checkboxes.
- Add a short note to `docs/TEAM.md`: front-end styling is owned by Person A from this branch.
- Commit the kit files, `docs/UI_PROGRESS.md` and `docs/TEAM.md`.

### 2. Rename to Focu
- `grep -rn "Locklings" src public manifest.config.ts index.html blocked.html README.md docs`. Sort each hit into (a) the app or brand name or (b) the creatures.
- Change only the (a) hits: manifest name and action title, the titles in `index.html` and `blocked.html`, `BrandLockup`, the onboarding and Home brand text, the tab title in the Adventure timer ("12:40 · Focu"), and notification titles. Keep the tagline.
- `public/logo.png` is now about 505 by 200 pixels. Check that nothing hardcodes the old size.
- Log every (a) hit you could not change.

### 3. Tier 1: tokens, recipes, background
- Read `src/index.css` and `src/app/motion.ts`.
- Remap and add tokens in `@theme` as described in DESIGN.md section 1. Make `rounded-card` and `shadow-card` use the new radius and shadow.
- Add all `focu-*` recipes from DESIGN.md section 3 as plain CSS in `@layer components`.
- Create `src/app/SceneBackground.tsx` (props `tone`, `progress`) and mount it once in `src/app/routes.tsx`, behind the pages. Choose the tone from the pathname using DESIGN.md section 7, and take `progress` from the active session on the timer page. Make `html` carry the cream color and `body` and `#root` transparent.
- Add swatches and recipe samples to the Gallery page.

### 4. Tier 2: shared components
Restyle, keeping every prop unchanged: Modal, FpBadge, ElementBadge, HpBar, MoveButton, PointsPreview, CreatureCard, LockboxChest, RevealCard, VictoryStamp, TimerRing, FloatingNumber, LockOverlay, the toast, `src/app/AppShell.tsx` and `src/app/BrandLockup.tsx`. Commit every 3 to 4 components. Show each one in the Gallery.

### 5. Tier 3: pages (class and wrapper edits only)
For every page: replace raw color classes (`slate-`, `indigo-`, `rose-`, `emerald-`, `amber-`, `red-`, `green-`, `blue-`) and ad-hoc buttons with the tokens and `focu-*` classes. Filled `bg-primary` buttons with white text become `focu-btn focu-btn--primary` (sunshine, ink text). `text-primary` links stay purple. Wrap content that floats directly on the scene in `focu-card`. Keep layouts and all text.
- 5a: Home, Onboarding
- 5b: AdventureSetup, AdventureActive, AdventureResult
- 5c: GymMap, Battle, Defeat, Lockbox
- 5d: Dojo, Lockdex, Settings
- 5e: Dev, Gallery, and `src/blocked/TrailClosed.tsx` (the blocked page mounts `<SceneBackground tone="dim" />` itself and imports `index.css`)

### 6. Sweep
- Search for leftover raw color classes, `text-white` on pastel fills, and em or en dashes in `src`. Fix them.
- Check that every new transition or tilt is disabled under `prefers-reduced-motion`.
- `git diff --stat origin/main` must list only allowed files. Restore any forbidden file with `git checkout origin/main -- <file>`.
- Run `npm run verify`.

### 7. Wrap-up
Write the final report at the top of `docs/UI_PROGRESS.md`:
- steps done, skipped, and the reasons
- anything you could not verify
- a "Morning checklist": the screens to eyeball and what to look for
Then run `git status` and `git log --oneline -20`, and STOP. Do not push.
