# FIXTURES.md: preset saves (Person A builds src/dev/fixtures.ts and the #/dev loader)

`export const FIXTURES: Record<FixtureId, () => GameState>` in src/dev/fixtures.ts.
The `#/dev` page lists one button per fixture. A button calls:
`platform.updateState(() => FIXTURES[id]())`.
For the two active-session fixtures, the button must instead call `platform.startSession(...)`
so the background installs real block rules (see notes). All fixtures set
`onboarded: true`, `trainerName: 'Tester'`, `version: 1`, empty `sessionHistory`,
`lastSeenSessionId: null`, `moveScrolls: []`, `pendingReward: null`, `activeSession: null`,
all stats 0, `lifetimeFp` equal to `fp`, unless stated. Creature `uid` = `u_<defId>`.
Each creature's `moveIds` default to its `defaultMoveIds` from SPEC 8.2 unless stated.

| Fixture | Creatures | Squad (in order) | FP | currentGymLevel | Settings | Other |
|---|---|---|---|---|---|---|
| `fresh` | none | empty | 0 | 1 | demoMode false | `onboarded: false`, `starterId: null` (use DEFAULT_STATE) |
| `mid` | embrit, tidepup | embrit, tidepup | 900 | 1 | demoMode true | starterId `embrit` |
| `rich` | all 9 | embrit, puddlo, sproutle | 5000 | 3 | demoMode true | starterId `embrit`; scrolls: `fire_blaze_burst` |
| `battleReady` | embrit, tidepup, mossling | embrit, tidepup, mossling | 600 | 1 | demoMode true | starterId `embrit` |
| `pendingReward` | embrit, tidepup | embrit, tidepup | 300 | 2 | demoMode true | `pendingReward`: gymLevel 1, chosenIndex null, applied false, boxes: move `fire_blaze_burst`, creature `marinox`, fp 250 |
| `activeSession` | embrit | embrit | 300 | 1 | demoMode false | Calls startSession: 25 min, sites instagram, tiktok, x. Real session. |
| `activeSessionAlmostDone` | embrit | embrit | 300 | 1 | demoMode true | Calls startSession: 1 min in Demo Mode (ends in about 1 second), sites instagram, tiktok, x |
| `demoSave` | embrit, tidepup | embrit, tidepup | 900 | 1 | demoMode true | The pre-pitch save from SPEC 15.1. Reset to this before every demo run. |

Notes
- `rich` is for Dojo and Lockdex work; it exercises "all moves learnable" and "all creatures owned" (Spark Pouch fallback).
- `battleReady` is deliberately the Gym 1 mirror test: starter embrit means the Gym 1 enemy is Cindercub with Spark.
- The `#/dev` page also has: "+1000 FP", "Finish Adventure now", and the Battle page (owned by B) shows its own small "Dev: win now" button when settings.demoMode is true, "Reset all".
- Fixtures must never be reachable when demoMode is false except `fresh`. Hide the dev panel unless Demo Mode is on.
