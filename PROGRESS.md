# Progress log

Each person only edits their own section (prevents merge conflicts).
Entry format: `- [hour] Task card | what was built | requirement IDs | left to do | decisions`

## Person A (Platform and Focus)

- [h0] A1 part 1 | Bare scaffold: Vite 8 + React 18 + TS strict + Tailwind 3 + @crxjs/vite-plugin 3 MV3 extension; index.html and blocked.html entries; background service worker (toolbar click opens or focuses index.html); placeholder icons; SETUP.md scripts incl. `npm run verify`; all SPEC 9.3 deps installed so B and C need no installs | M0 | A1 part 2 (routes, platform, store, fixtures, ToastHost); load unpacked in Chrome to confirm | Decisions: (1) `"type": "module"` in package.json because C's tailwind.config.js uses `export default`. (2) `test` script is `vitest run --passWithNoTests`, because tests/** is B's lane and A adds no smoke test; B's first test replaces the need. (3) tailwind.config.js and src/index.css were created by the user (C's lane), not by A; A only added postcss.config.js and the CSS imports. (4) Scaffold is committed on a/platform only; the user merges to main.
- [h1] A1 part 2 | All 15 routes in routes.tsx (HashRouter, placeholders; B/C pages imported from the user's placeholders); Platform interface + webPlatform (localStorage, stub sessions returning NOT_IMPLEMENTED); store.ts useGameState() (zustand); src/dev/fixtures.ts with all 8 fixtures; Dev page with fixture loader, +1000 FP, Reset all, on-screen errors; A's 6 other placeholder pages | M0 | extensionPlatform (A2/A3), real guards (A4), hide Dev unless demoMode, 'Finish Adventure now', ToastHost (waiting on C), swap stubTypes.ts for src/types.ts and src/data when B lands, load unpacked in Chrome | Decisions: (1) src/dev/stubTypes.ts is a TEMP copy of SPEC 9.7 types and 8.2 default moves. (2) Storage key hardcoded 'locklings:v1' until CONFIG lands. (3) platform currently always webPlatform; extension detection is exported as isExtensionContext. (4) ToastHost skipped per user.

## Person B (Engine and Battle)

- [h0] B1 | Created the frozen game type model and the initial engine data catalog: `src/types.ts`, `src/data/config.ts`, `src/data/moves.ts`, `src/data/creatures.ts`, `src/data/gyms.ts`, and `src/data/sites.ts`; added `tests/engine-data.test.ts` to lock the move, creature, gym, and category counts and confirm default moves match each creature's element | M1 | Continue with `points.ts`, `typeChart.ts`, and the first battle tests | Decisions: B is implementing the fixed catalog directly from SPEC Sections 7 and 8, with no UI assumptions and no magic-number leakage into components.

## Person C (Design and Collection)

- [hour 1] Task C1 | Tailwind tokens (SPEC 10.2 colours plus ring-track), bundled Fredoka/Nunito in index.css, motion.ts (ease/spring/dur/stagger), stubs of every CONTRACTS component exported from components/index.ts | 10.1, 10.2, 10.8.2 | C2 completed below | Stubs use local stubTypes.ts until B's types.ts is on main. Duration tokens stored in seconds for Framer Motion.
- [hour 1] Task C1 follow-up | Component stubs now import ElementType, SpriteState, MoveDef, FpBreakdown, LockboxContent from src/types.ts; removed src/app/components/stubTypes.ts | CONTRACTS component props | C2 | Switched as soon as B's types.ts landed.
- [hour 2] Task C2 | Real emoji CreatureSprite with element circle, shadow, UID idle delay, facing, particles, and idle/hop/sentOut/selected motion; Gallery includes all components, all 9 Locklings, and a state switcher | 8.2, 10.8.3 | Remaining sprite states are C4 | `npm run typecheck` and `npm run build` pass.
- [hour 4] Task C3 | Dojo roster/detail, FP and scroll lessons, shortage prompts, four-move replacement modal protecting the final attack; Lockdex 3×3 elemental grid with silhouettes, squad add/remove/reorder, Move Scroll inventory | DOJO-01–09, DEX-01–04, S11/S12 | Swap `c3EngineFallback.ts` functions for B's engine exports when merged | Uses A's rich/mid fixture data through the existing Dev fixture loader; local functions preserve B's documented signatures until merge.

## Sync log (merge captain only)
