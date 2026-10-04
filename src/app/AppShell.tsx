import { Link, useLocation } from 'react-router-dom'
import { useGameState } from './store'

const HIDDEN_EXACT = ['/', '/onboarding', '/adventure']

/** Slim top bar, rendered once above the animated pages so it does not animate between them. */
export default function AppShell() {
  const state = useGameState()
  const { pathname } = useLocation()
  if (!state) return null
  if (HIDDEN_EXACT.includes(pathname) || pathname.startsWith('/battle/')) return null

  const inAdventure = state.activeSession !== null
  const label = inAdventure ? 'Back to Adventure' : 'Back to Home'
  return (
    <nav className="home-bar sticky top-0 z-40 px-4 py-1">
      <Link
        to={inAdventure ? '/adventure' : '/'}
        aria-label={label}
        className="inline-flex min-h-tap items-center gap-2 font-display font-semibold text-ink"
      >
        <img src="/icon128.png" alt="" width={28} height={28} />
        <span aria-hidden="true">←</span>
        <span>{inAdventure ? 'Adventure' : 'Home'}</span>
      </Link>
    </nav>
  )
}
