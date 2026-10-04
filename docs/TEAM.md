# TEAM.md: how three people build Locklings in parallel and merge cleanly

Three people, three branches, zero shared files. Everyone builds against the frozen
contracts in docs/CONTRACTS.md. Pages consume components and engine functions; they never
edit them.

## Lanes (who may edit what)

### Person A: Focus and Platform  (branch: a/platform)
Owns the Chrome extension, Adventures, blocking, app shell and routing.
- manifest.config.ts, vite.config.ts, package.json, package-lock.json, tsconfig*, index.html, blocked.html
- src/background/**   src/blocked/**   src/platform/**   src/dev/**
- src/app/main.tsx, App.tsx, routes.tsx, store.ts
- Pages: Onboarding, Home, AdventureSetup, AdventureActive, AdventureResult, Settings, Dev
- Milestones: M0, M4, M5, M6, plus Settings, Demo Mode, dev panel, fixtures
- Only A runs `npm install` for new packages (everyone else asks A).

### Person B: Engine and Battle  (branch: b/engine)
Owns all game rules, content data, battles and rewards.
- src/types.ts   src/data/**   src/engine/**   tests/**
- Pages: GymMap, Battle, Defeat, Lockbox
- Milestones: M1, M2, M3, M8, engine half of M9 (training, squad)
- Merge captain (lightest load during hours 7 to 11).

### Person C: Design and Collection  (branch: c/design)
Owns look, feel, motion and the collection screens.
- tailwind.config.*, src/index.css, src/app/motion.ts, src/app/components/**, public/assets/**
- Pages: Dojo, Lockdex, Gallery
- Milestones: SPEC Section 10.8, UI half of M9, M10 (animations)

Rule: need a change in someone else's lane? Do not make it. Message the owner the exact
change (file, what, why). If it is a contract change, follow the procedure below.

## Frozen contracts (hour 1.5 onward)
types.ts, config.ts, data/*, the Platform interface, the message protocol, the route list,
component props, engine function signatures (all in docs/CONTRACTS.md).
Contract change procedure:
1. Open a tiny PR titled `contract: <what>`. Only the lane owner of that file edits it.
2. Announce in the team chat.
3. Merge within 15 minutes. Everyone rebases on main.
Adding a field is cheap. Renaming or removing is expensive: avoid it.

## Timeline

| Hours | A: Platform | B: Engine | C: Design |
|---|---|---|---|
| 0 to 0.5 | A pushes bare scaffold to main (A1 part 1) | Writes types.ts and config.ts in scratch | Designs tokens, picks fonts, sketches art |
| 0.5 to 1.5 | Routes (all placeholders), Platform interface, fixtures skeleton, verify script | Pushes types.ts + config.ts first (within 20 min of scaffold), then data/*, rng.ts | Pushes tokens, Tailwind config, stubs of EVERY component in CONTRACTS.md, motion.ts |
| **SYNC 0 (1.5)** | Merge all three branches to main. Everyone pulls. Empty app loads as an extension. | | |
| 1.5 to 3 | Storage, extensionPlatform, webPlatform, store, Onboarding | points.ts, typeChart.ts + tests | Real CreatureSprite (idle, hop, shadow), Gallery page |
| 3 to 7 | M5: background, blocking, Trail Closed | training.ts, squad.ts, onboarding.ts + tests, then start battle.ts | Dojo UI, Lockdex and Squad UI, forget-move modal |
| **SYNC 1 (7)** | Real blocking works. Points engine tested. Dojo clickable on fixtures. | | |
| 7 to 11 | M6: Setup + live preview, Active timer, Result, Home, route guards | battle.ts and ai.ts complete with tests | Remaining sprite states, PointsPreview, TimerRing, particles |
| **SYNC 2 (11)** | Adventure loop works end to end. All engine tests pass. | | |
| 11 to 15 | Edge cases E1 to E6, reconcile, Demo Mode, dev panel, full fixtures | GymMap, Battle page, Defeat | HpBar ghost, MoveButton, floating numbers, page transitions |
| **SYNC 3 (15)** | Battle playable on real state. | | |
| 15 to 18 | Settings, reset, blocking regression | rewards.ts, Lockbox page | LockboxChest, RevealCard, VictoryStamp, Confetti |
| **SYNC 4 (18)** | Full loop playable start to finish. | | |
| 18 to 21 | Fix Chrome-seam bugs | Balance tuning (config and data only) | Polish, art swap, reduced motion |
| **FREEZE (21)** | Only P0 bug fixes after this point. | | |
| 21 to 24 | Split SPEC 13.2 QA three ways, demo save, backup video, rehearse x3 | | |

## Handoffs (who waits on whom)

| Needs | From | What | Due | Stub until then |
|---|---|---|---|---|
| A | B | calculateFp | hour 3 | Returns base FP only |
| A | B | completeOnboarding | hour 3 | A writes the minimal state by hand in the page, replaces after |
| A | C | TimerRing, PointsPreview | hour 11 | Plain text countdown and plain text FP |
| B | C | HpBar, MoveButton, CreatureSprite states, FloatingNumber | hour 11 | Stubs from hour 1.5 |
| B | C | LockboxChest, RevealCard, VictoryStamp, Confetti | hour 15 | Plain buttons and text |
| C | B | learnableMoves, learnMove, squad functions | hour 7 | C builds the UI against fixtures and a local fake |
| B and C | A | Fixtures and `#/dev` loader | hour 3 | Build state objects by hand |

B's order is driven by this table: types, points, training/squad/onboarding, battle, rewards.

## Sync checklists (do these on main, not on anyone's branch)

SYNC 0 (hour 1.5)
- [ ] `npm run verify` passes on main
- [ ] Extension loads unpacked; clicking the icon opens the app
- [ ] All routes render a placeholder; `#/gallery` and `#/dev` exist
- [ ] Every component in CONTRACTS.md exists as a stub with the final props

SYNC 1 (hour 7)
- [ ] Visit a blocked site during a session: Trail Closed appears
- [ ] "Visit site anyway" ends the session with 0 FP and loads the site
- [ ] `npm test` passes all points, typeChart and training tests
- [ ] Dojo works using the `mid` and `rich` fixtures

SYNC 2 (hour 11)
- [ ] Demo Mode on: Setup (25 min, Instagram + TikTok + X) shows 500 FP; session completes; FP added once
- [ ] Close Chrome mid-session, reopen after end: FP awarded exactly once
- [ ] Battle and engine tests pass (battle, ai)

SYNC 3 (hour 15)
- [ ] Win Gym 1 and lose Gym 5 using the `battleReady` fixture
- [ ] Forced switch works; switch uses the turn; heals respect 2 uses

SYNC 4 (hour 18)
- [ ] Full loop: Adventure, Dojo, Gym win, Lockbox, new Lockling in Lockdex
- [ ] Refresh mid-Lockbox reveal: same boxes, no double reward
- [ ] Run SPEC 15.2 demo script once, end to end

## Git rules
- Branches: a/platform, b/engine, c/design. Never push to main directly.
- Small PRs per task card. Run `npm run verify` before every PR.
- A teammate skims each PR for contract violations only (10-minute turnaround).
- Rebase on main before starting each new task card: `git fetch && git rebase origin/main`.
- package-lock.json conflict: take main's version, then run `npm install`.
- Merge captain (B) performs the merges at each SYNC point and logs them in PROGRESS.md.
- Commit format: `[A] M5: block rules (BLK-01, BLK-02)`.
- Never force-push a shared branch. Never edit SPEC.md (log decisions in PROGRESS.md).

## Where merges usually break, and why they will not here
- Two people add a route: all routes already exist as placeholders.
- Two people edit the same component: only C edits components.
- Data drift between UI and engine: UI reads only from src/data, which only B edits.
- Two people append to the same log: PROGRESS.md has one section per person.
- "Works on my branch": every SYNC checklist runs on main.

## Note: UI skin
Front-end styling is owned by Person A from branch a/ui-skin (see docs/UI_RUNBOOK.md and docs/DESIGN.md). Styling only, no logic changes.
