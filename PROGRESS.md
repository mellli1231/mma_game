# Progress log

Each person only edits their own section (prevents merge conflicts).
Entry format: `- [hour] Task card | what was built | requirement IDs | left to do | decisions`

## Person A (Platform and Focus)

- [h0] A1 part 1 | Bare scaffold: Vite 8 + React 18 + TS strict + Tailwind 3 + @crxjs/vite-plugin 3 MV3 extension; index.html and blocked.html entries; background service worker (toolbar click opens or focuses index.html); placeholder icons; SETUP.md scripts incl. `npm run verify`; all SPEC 9.3 deps installed so B and C need no installs | M0 | A1 part 2 (routes, platform, store, fixtures, ToastHost); load unpacked in Chrome to confirm | Decisions: (1) `"type": "module"` in package.json because C's tailwind.config.js uses `export default`. (2) `test` script is `vitest run --passWithNoTests`, because tests/** is B's lane and A adds no smoke test; B's first test replaces the need. (3) tailwind.config.js and src/index.css were created by the user (C's lane), not by A; A only added postcss.config.js and the CSS imports. (4) Scaffold is committed on a/platform only; the user merges to main.
- [h1] A1 part 2 | All 15 routes in routes.tsx (HashRouter, placeholders; B/C pages imported from the user's placeholders); Platform interface + webPlatform (localStorage, stub sessions returning NOT_IMPLEMENTED); store.ts useGameState() (zustand); src/dev/fixtures.ts with all 8 fixtures; Dev page with fixture loader, +1000 FP, Reset all, on-screen errors; A's 6 other placeholder pages | M0 | extensionPlatform (A2/A3), real guards (A4), hide Dev unless demoMode, 'Finish Adventure now', ToastHost (waiting on C), swap stubTypes.ts for src/types.ts and src/data when B lands, load unpacked in Chrome | Decisions: (1) src/dev/stubTypes.ts is a TEMP copy of SPEC 9.7 types and 8.2 default moves. (2) Storage key hardcoded 'locklings:v1' until CONFIG lands. (3) platform currently always webPlatform; extension detection is exported as isExtensionContext. (4) ToastHost skipped per user.

## Person B (Engine and Battle)

## Person C (Design and Collection)

## Sync log (merge captain only)
