# PROMPTS.md: paste-ready prompts

## Kickoff prompts (paste once at the start of the very first session)

### Person A
```
You are working for Person A (Focus and Platform) on a 3-person team. Branch: a/platform.
Read SPEC.md, CLAUDE.md, docs/TEAM.md, docs/CONTRACTS.md, docs/FIXTURES.md.
You may edit ONLY Person A's lane in docs/TEAM.md. Never edit files owned by B or C
or any frozen contract file. If you need a change outside your lane, stop and give me
the exact change to message the owner.
Always make a plan first and wait for my approval before editing. Run npm run verify
before every commit. Log progress in my section of PROGRESS.md.
Start with task card A1 part 1 (bare scaffold only).
```

### Person B
```
You are working for Person B (Engine and Battle) on a 3-person team. Branch: b/engine.
Read SPEC.md, CLAUDE.md, docs/TEAM.md, docs/CONTRACTS.md.
You may edit ONLY Person B's lane in docs/TEAM.md. Never edit files owned by A or C.
If you need a change outside your lane, stop and give me the exact change to message the owner.
Always make a plan first and wait for my approval before editing. Run npm run verify
before every commit. Log progress in my section of PROGRESS.md.
Engine code must be pure TypeScript with injected rng and unit tests for every rule in SPEC Section 7.
Start with task card B1.
```

### Person C
```
You are working for Person C (Design and Collection) on a 3-person team. Branch: c/design.
Read SPEC.md (especially Section 10), CLAUDE.md, docs/TEAM.md, docs/CONTRACTS.md.
You may edit ONLY Person C's lane in docs/TEAM.md. Never edit files owned by A or B.
If you need a change outside your lane, stop and give me the exact change to message the owner.
Always make a plan first and wait for my approval before editing. Run npm run verify
before every commit. Log progress in my section of PROGRESS.md.
Animate only transform and opacity. Components must keep the exact props in docs/CONTRACTS.md.
Start with task card C1.
```

## Start of every later session (all three)
```
I am Person [A/B/C]. Read CLAUDE.md, docs/TEAM.md, docs/CONTRACTS.md and my section of PROGRESS.md,
then run git log --oneline -10. Rebase on origin/main first if main has moved. Then do task card [ID].
Plan first. Show me the plan before editing.
```

## Task cards: Person A

**A1 (hours 0 to 1.5): scaffold, routes, platform skeleton**
```
Task A1. Read SPEC 9.1 to 9.5, 10.3 and docs/CONTRACTS.md.
Part 1 (push to main within 30 min): scaffold Vite + React 18 + TypeScript strict + Tailwind +
@crxjs/vite-plugin MV3 extension with index.html and blocked.html entries and a background service
worker at src/background/index.ts. Add Vitest and the package.json scripts in docs/SETUP.md
(including npm run verify). Toolbar icon opens index.html in a tab.
Part 2: create every route in CONTRACTS.md (including #/dev and #/gallery) as a placeholder page that
shows its own name, in the correct owner's file path under src/app/pages/. Create src/platform/platform.ts
with the Platform interface from CONTRACTS.md and a webPlatform that uses localStorage. Create
src/app/store.ts with useGameState(). Create src/dev/fixtures.ts with all FIXTURES from docs/FIXTURES.md
(use DEFAULT_STATE and types from B once B's types.ts lands; until then stub). Mount ToastHost in App.tsx.
Done when: npm run verify passes, extension loads unpacked, every route renders.
```
**A2 (hours 1.5 to 3): storage and onboarding**
```
Task A2. Read SPEC 5.1, 6.1, 6.2, 9.9, 9.12. Implement storage.ts (loadState, updateState, subscribe, migrate),
extensionPlatform (chrome.storage.local + chrome.storage.onChanged), platform.ts selection, and the
Onboarding and Home pages using completeOnboarding from B's engine (use a local stub if it has not landed).
Done when: fresh install shows onboarding, picking Puddlo shows Home with 300 FP, state survives closing the tab.
```
**A3 (hours 3 to 7): blocking, the riskiest card**
```
Task A3 (SPEC M5). Read SPEC 5.2, 5.3, 6.5, 9.6, 9.10, 9.11. Implement src/background/index.ts, sessionManager.ts,
blockRules.ts and the Trail Closed page (src/blocked/) with the Leave the trail flow. Include reconcile() on
startup, install and service worker load, and the aws.amazon.com exclusion. Wire platform.startSession,
checkSession and abandonSession in extensionPlatform.
Done when: SYNC 1 checklist items for blocking pass in real Chrome (instagram.com, www., m. all blocked; Leave the
trail works; completion awards FP once; closing Chrome mid-session then reopening after end awards FP once).
```
**A4 (hours 7 to 11): Adventure screens**
```
Task A4 (SPEC M6). Read SPEC 6.2 to 6.4, 6.6, 10.4 (S2 to S5). Build AdventureSetup with live PointsPreview
(calculateFp from B, PointsPreview from C), AdventureActive using TimerRing (derive remaining time from endsAt,
never a decrementing counter), AdventureResult (complete and lost), Home banner during a session, and the route
guards in routes.tsx (RUN-06, ONB-01, locked Battle and Dojo).
Done when: SYNC 2 checklist passes.
```
**A5 (hours 11 to 15): edge cases, Demo Mode, dev panel**
```
Task A5. Read SPEC 6.12, 11 (E1 to E6, E21, E23), 15.1. Implement Demo Mode (60x time scale, min 1 minute),
the full #/dev page with every fixture, and cover edge cases E1 to E6. Verify each in Chrome.
Done when: every fixture loads correctly and E1 to E6 behave as the table says.
```
**A6 (hours 15 to 18): settings and regression**
```
Task A6. Read SPEC 6.12 and 13.2. Build Settings (Demo toggle, Reset with double confirmation that also
clears block rules). Run QA checklist items 1 to 7 and 12 on main and fix anything in your lane.
```
**A7 (hours 21 to 24): ship**
```
Task A7. Freeze: P0 bug fixes only. Run the full SPEC 13.2 checklist split with B and C, confirm the demoSave
fixture matches SPEC 15.1, and prepare the extension zip from dist for judges.
```

## Task cards: Person B

**B1 (hours 0 to 1.5): types, config, data**
```
Task B1. Read SPEC 7, 8, 9.7, 9.8 and docs/CONTRACTS.md.
FIRST (push to your branch and tell the team within 20 minutes of the scaffold landing): src/types.ts (SPEC 9.7 plus
the extra types in CONTRACTS.md) and src/data/config.ts (SPEC 9.8).
THEN: src/data/moves.ts, creatures.ts, gyms.ts, sites.ts exactly matching SPEC 8 (21 moves, 9 creatures, 5 gyms,
6 categories, 37 sites incl. the Amazon excludedDomains), src/data/copy.ts from SPEC 10.5, src/engine/rng.ts
(mulberry32). Add tests/data.test.ts asserting counts, that every creature default move matches its element, and
that every gym team member and move id exists.
Done when: npm run verify passes.
```
**B2 (hours 1.5 to 3): points and type chart**
```
Task B2. Read SPEC 7.1, 7.2. Implement points.ts (getTier, calculateFp returning FpBreakdown) and typeChart.ts.
Tests: all 8 worked examples in SPEC 7.1.4, tier boundaries 60/61/120/121, all 9 type chart cells.
Tell Person A when calculateFp is merged.
```
**B3 (hours 3 to 7): training, squad, onboarding**
```
Task B3. Read SPEC 6.10, 6.11, 7.3, 7.4, 13.1. Implement training.ts (learnableMoves, learnMove), squad.ts,
onboarding.ts per docs/CONTRACTS.md. learnMove throws on element mismatch, insufficient FP, duplicate, fifth move
without forgetMoveId, and forgetting the last attack move; scroll source costs 0 and removes the scroll.
Tests for every throw. Tell Persons A and C as each function merges.
```
**B4 (hours 3 to 11): battle and AI**
```
Task B4 (SPEC M3). Read SPEC 7.2 to 7.7, 8.3, 9.13. Implement battle.ts (createBattle incl. MIRROR tokens,
applyPlayerAction, applyEnemyTurn, applyForcedSwitch, calcDamage, calcHeal, rollHit) and ai.ts as pure functions
with injected rng. Tests: every row in SPEC 7.5, miss at rng 0.29 and hit at 0.30, heal uses and cap, switch uses the
turn, forced switch does not, auto send-out, victory/defeat, forfeit, Gym 1 mirror for each starter, AI heal threshold
at 35 and 36 HP, AI best-move probability.
Done when: SYNC 2 engine tests pass.
```
**B5 (hours 11 to 15): GymMap, Battle, Defeat**
```
Task B5. Read SPEC 6.7, 6.8, 10.4 (S7, S8, S10). Build GymMap, Battle (useReducer around the engine, sequential
event playback waiting on animations, enemy turn delay 900 ms, forced-switch modal, forfeit confirm) and Defeat,
composing C's components (CreatureSprite states, HpBar, MoveButton, FloatingNumber). Use only the props in
CONTRACTS.md. Add the small "Dev: win now" button when settings.demoMode is true.
Done when: SYNC 3 checklist passes.
```
**B6 (hours 15 to 18): rewards and Lockbox**
```
Task B6. Read SPEC 6.9, 7.8, 10.4 (S9). Implement rewards.ts (rollLockboxes, clearGym, recordBattleLoss,
chooseLockbox, dismissReward) with tests (no duplicates across boxes, owned excluded, empty pool gives Spark Pouch).
Build the Lockbox page with LockboxChest, RevealCard, Teach now / Save for later. Refresh mid-reveal must not
double-apply.
```
**B7 (hours 18 to 21): balance**
```
Task B7. Playtest all five gyms with battleReady and rich fixtures. Tune ONLY numbers in config.ts and data files
so Gym 1 is easy to win and Gym 5 is very hard early. Write each change as a decision in PROGRESS.md.
```

## Task cards: Person C

**C1 (hours 0 to 1.5): tokens, motion, stubs**
```
Task C1. Read SPEC 10.1, 10.2, 10.8 and docs/CONTRACTS.md. Create tailwind.config with the design tokens, bundled
fonts (@fontsource/fredoka, nunito), src/index.css, src/app/motion.ts (SPEC 10.8.2 tokens), and a STUB of every
component listed in CONTRACTS.md with the exact final props, exported from src/app/components/index.ts. Stubs
may be plain elements/emoji. Push within 90 minutes. Tell A and B as soon as it is on your branch.
Done when: npm run verify passes and every component can be imported.
```
**C2 (hours 1.5 to 3): CreatureSprite and Gallery**
```
Task C2. Read SPEC 8.2, 10.8.3. Implement the real CreatureSprite (emoji body on element-colored circle, shadow,
transform-origin bottom center, idle delay from uid hash, states idle, hop, sentOut, selected first) and the
Gallery page showing every component in every state with a state switcher.
```
**C3 (hours 3 to 7): Dojo and Lockdex**
```
Task C3. Read SPEC 6.10, 6.11, 10.4 (S11, S12). Build Dojo (list, detail, learnable moves, Need N more FP,
forget-move Modal that blocks forgetting the last attack move) and Lockdex (3x3 grid with silhouettes, squad
editor with arrows). Use learnableMoves, learnMove and squad functions from B (fake locally until merged) and
the rich and mid fixtures from A.
```
**C4 (hours 7 to 11): timer, preview, remaining sprite states**
```
Task C4. Read SPEC 10.4 (S3, S4), 10.8.3, 10.8.4. Implement TimerRing (SVG ring, remaining = endsAt - Date.now(),
250 ms tick), PointsPreview, the remaining sprite states (attack, hit, miss, heal, zonedOut, celebrate, sleepy),
and element particles.
```
**C5 (hours 11 to 15): battle feel**
```
Task C5. Read SPEC 10.8.3, 10.8.5. Implement HpBar with the ghost bar, MoveButton (effectiveness tag, heal uses),
FloatingNumber, page transitions (Framer Motion AnimatePresence) and button press motion. Tell B when each is real.
```
**C6 (hours 15 to 18): rewards motion**
```
Task C6. Read SPEC 10.4 (S9), 10.8.5. Implement LockboxChest (wobble, hover lift, shake, pop), RevealCard
(rarity glows), VictoryStamp, and Confetti (canvas-confetti in element colors).
```
**C7 (hours 18 to 24): polish**
```
Task C7. Polish pass: reduced-motion support everywhere (SPEC 10.7, 10.8.6), swap emoji for PNG art if available
(same filenames), contrast and focus rings, tidy the Gallery. Freeze at hour 21: only fix bugs.
```

## Merge captain prompt (Person B, at each SYNC)
```
SYNC [n]. Fetch all branches. For each open PR: run npm run verify on the merge result, check the diff only touches
the author's lane (docs/TEAM.md) and does not change a frozen contract without a contract: PR. Merge in this order:
b/engine, then c/design, then a/platform. Run the SYNC [n] checklist from docs/TEAM.md on main and report every
failing item with the owner's name. Append the result to the Sync log in PROGRESS.md.
```
