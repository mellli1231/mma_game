// TEMP shim: Person C's src/app/c3EngineFallback.ts still imports GameState from here. Delete once C imports from '@/types' or removes the fallback.
// TEMP shim: B's tests/onboarding.test.ts still imports DEFAULT_STATE from here. Delete once that test imports from '@/platform/defaultState' instead.
export type { GameState } from '@/types'
export { DEFAULT_STATE } from '@/platform/defaultState'
