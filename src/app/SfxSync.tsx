import { useGameState } from './store'
import { setSfxEnabled } from './sfx'

/** Keeps the sound module in step with the saved Sound setting. A missing value counts as on. */
export default function SfxSync() {
  const state = useGameState()
  setSfxEnabled(state?.settings.sound !== false)
  return null
}
