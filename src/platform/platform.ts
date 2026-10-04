import type { FocusSession, GameState } from '@/types'
import { extensionPlatform } from './extensionPlatform'
import { webPlatform } from './webPlatform'

export interface StartSessionInput { durationMin: number; siteIds: string[]; customDomains: string[] }
export type StartSessionResult = { ok: true; session: FocusSession } | { ok: false; error: string }

export interface Platform {
  isExtension: boolean
  loadState(): Promise<GameState>
  updateState(mutator: (s: GameState) => GameState): Promise<GameState>
  subscribe(cb: (s: GameState) => void): () => void
  startSession(input: StartSessionInput): Promise<StartSessionResult>
  checkSession(): Promise<FocusSession | null>
  abandonSession(reason: 'gave_up' | 'visited_blocked', siteId?: string): Promise<void>
}

export const isExtensionContext = typeof chrome !== 'undefined' && !!chrome.runtime?.id

export const platform: Platform = isExtensionContext ? extensionPlatform : webPlatform
