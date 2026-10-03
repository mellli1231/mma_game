import { useEffect } from 'react'
import { create } from 'zustand'
import type { GameState } from '@/dev/stubTypes'
import { platform } from '@/platform/platform'

interface Store { state: GameState | null }
const useStore = create<Store>(() => ({ state: null }))

let started = false
function hydrate() {
  if (started) return
  started = true
  platform.loadState().then(state => useStore.setState({ state }))
  platform.subscribe(state => useStore.setState({ state }))
}

/** Current GameState, or null until storage has loaded. */
export function useGameState(): GameState | null {
  useEffect(hydrate, [])
  return useStore(s => s.state)
}
