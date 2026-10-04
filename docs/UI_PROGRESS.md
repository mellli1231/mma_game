# UI progress (Focu skin, branch a/ui-skin)

## Steps
- [x] 0 Preflight
- [x] 1 Kit commit
- [x] 2 Rename to Focu
- [x] 3 Tier 1: tokens, recipes, background
- [ ] 4 Tier 2: shared components
- [ ] 5a Home, Onboarding
- [ ] 5b AdventureSetup, AdventureActive, AdventureResult
- [ ] 5c GymMap, Battle, Defeat, Lockbox
- [ ] 5d Dojo, Lockdex, Settings
- [ ] 5e Dev, Gallery, TrailClosed
- [ ] 6 Sweep
- [ ] 7 Wrap-up

## Log
- Step 2: renamed manifest name/action title, index.html title, BrandLockup, timer tab title. Creature uses of "Locklings" kept. Notification title ("Adventure complete!") has no brand name; its message mentions creatures, so unchanged. blocked.html title is "Trail Closed", unchanged. Nothing hardcodes the logo.png size. README.md and docs/TEAM.md titles left as is (docs, not the app).
- Rule change mid-run: all file writes via Edit/Write only (added to runbook Overrides). Steps 1 to 3 were partly written with sed/python before the rule arrived; nothing since.
- Step 3: tokens remapped in @theme, focu-* recipes in @layer components, SceneBackground mounted in routes.tsx (SceneLayer: full on / and /onboarding and completed result, dim elsewhere, timer tint from active session progress). Fredoka 500/700 and Nunito 800 css imports added (already installed). Gallery has swatches and recipe samples. Decision: body and #root transparent, html cream.
