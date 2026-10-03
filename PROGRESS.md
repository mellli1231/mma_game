# Progress log

Each person only edits their own section (prevents merge conflicts).
Entry format: `- [hour] Task card | what was built | requirement IDs | left to do | decisions`

## Person A (Platform and Focus)

- [h0] A1 part 1 | Bare scaffold: Vite 8 + React 18 + TS strict + Tailwind 3 + @crxjs/vite-plugin 3 MV3 extension; index.html and blocked.html entries; background service worker (toolbar click opens or focuses index.html); placeholder icons; SETUP.md scripts incl. `npm run verify`; all SPEC 9.3 deps installed so B and C need no installs | M0 | A1 part 2 (routes, platform, store, fixtures, ToastHost); load unpacked in Chrome to confirm | Decisions: (1) `"type": "module"` in package.json because C's tailwind.config.js uses `export default`. (2) `test` script is `vitest run --passWithNoTests`, because tests/** is B's lane and A adds no smoke test; B's first test replaces the need. (3) tailwind.config.js and src/index.css were created by the user (C's lane), not by A; A only added postcss.config.js and the CSS imports. (4) Scaffold is committed on a/platform only; the user merges to main.

## Person B (Engine and Battle)

## Person C (Design and Collection)

## Sync log (merge captain only)
