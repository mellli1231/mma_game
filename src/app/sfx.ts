import { MOVES } from '@/data/moves'
import type { BattleEvent } from '@/types'

export type SfxName = 'attack' | 'healing' | 'miss' | 'win'

export const SFX_FILES: Record<SfxName, string> = {
  attack: '/assets/sfx/attack.mp3',
  healing: '/assets/sfx/healing.mp3',
  miss: '/assets/sfx/attack-miss.mp3',
  win: '/assets/sfx/win.mp3',
}

/** Master volume, 0 to 1. */
export const SFX_VOLUME = 0.6

/** Per sound loudness multiplier, for balancing the files against each other. */
export const SFX_GAIN: Record<SfxName, number> = {
  attack: 1,
  healing: 1,
  miss: 1,
  win: 1,
}

/** A repeat of the same sound inside this window is ignored. */
const REPEAT_GUARD_MS = 80

const cache = new Map<SfxName, HTMLAudioElement>()
const lastPlayed = new Map<SfxName, number>()
let enabled = true

export function setSfxEnabled(value: boolean) {
  enabled = value
}

export function isSfxEnabled() {
  return enabled
}

function getAudio(name: SfxName): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  let audio = cache.get(name)
  if (!audio) {
    audio = new Audio(SFX_FILES[name])
    audio.preload = 'auto'
    cache.set(name, audio)
  }
  return audio
}

/** Fire and forget. A missing file, blocked autoplay or any other failure is swallowed. */
export function playSfx(name: SfxName) {
  if (!enabled) return
  try {
    const now = Date.now()
    if (now - (lastPlayed.get(name) ?? 0) < REPEAT_GUARD_MS) return
    lastPlayed.set(name, now)
    const base = getAudio(name)
    if (!base) return
    // A clone lets the same sound overlap itself.
    const clip = base.cloneNode() as HTMLAudioElement
    clip.volume = Math.min(1, Math.max(0, SFX_VOLUME * SFX_GAIN[name]))
    clip.play()?.catch(() => {})
  } catch {
    // Sound is optional. Never let it break the app.
  }
}

/** Pure mapping from a battle event to the sound that goes with it, or null for silence. */
export function sfxForEvent(event: BattleEvent): SfxName | null {
  switch (event.type) {
    case 'MOVE_USED': {
      const moveName = event.message.match(/^.+ used (.+)!$/)?.[1]
      const move = moveName ? Object.values(MOVES).find((candidate) => candidate.name === moveName) : undefined
      return move?.effect === 'attack' ? 'attack' : null
    }
    case 'MISSED':
      return 'miss'
    case 'HEALED':
      return 'healing'
    case 'VICTORY':
      return 'win'
    default:
      return null
  }
}

export function playSfxForEvent(event: BattleEvent) {
  const name = sfxForEvent(event)
  if (name) playSfx(name)
}
