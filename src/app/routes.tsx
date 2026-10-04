import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { HashRouter, matchPath, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useGameState } from './store'
import { useEffect, useState } from 'react'
import { ease } from './motion'
import { sessionRedirect } from './sessionRoutes'
import AppShell from './AppShell'
import SceneBackground from './SceneBackground'
import SfxSync from './SfxSync'
import { getGymBackground } from './gymBackgrounds'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import AdventureSetup from './pages/AdventureSetup'
import AdventureActive from './pages/AdventureActive'
import AdventureResult from './pages/AdventureResult'
import GymMap from './pages/GymMap'
import Battle from './pages/Battle'
import Lockbox from './pages/Lockbox'
import Defeat from './pages/Defeat'
import Dojo from './pages/Dojo'
import Lockdex from './pages/Lockdex'
import Settings from './pages/Settings'
import Dev from './pages/Dev'
import Gallery from './pages/Gallery'

// Dev tools stay reachable before onboarding so a fixture can be loaded from a fresh save.
const ONBOARDING_EXEMPT = ['/dev', '/gallery']

/** ONB-01. Only rendered once state has loaded (App shows a loading view until then). */
function OnboardingGuard({ children }: { children: ReactNode }) {
  const state = useGameState()
  const { pathname } = useLocation()
  if (!state) return null
  const onOnboarding = pathname === '/onboarding'
  if (!state.onboarded && !onOnboarding && !ONBOARDING_EXEMPT.includes(pathname)) {
    return <Navigate to="/onboarding" replace />
  }
  if (state.onboarded && onOnboarding) return <Navigate to="/" replace />
  // RUN-06, unseen ended session (DONE-05) and pending Lockbox redirects.
  const target = sessionRedirect(state, pathname)
  if (target && target !== pathname) return <Navigate to={target} replace />
  return <>{children}</>
}

// Routes that show the full painting. Everything else uses the dimmed scene.
const FULL_SCENE_ROUTES = ['/', '/onboarding']
const TIMER_TICK_MS = 1000

function SceneLayer() {
  const location = useLocation()
  const { pathname } = location
  const state = useGameState()
  const [now, setNow] = useState(() => Date.now())
  const session = state?.activeSession ?? null
  const onTimer = pathname === '/adventure'
  useEffect(() => {
    if (!onTimer) return
    const id = window.setInterval(() => setNow(Date.now()), TIMER_TICK_MS)
    return () => window.clearInterval(id)
  }, [onTimer])

  let progress: number | undefined
  if (onTimer && session) {
    const total = session.endsAt - session.startedAt
    progress = total > 0 ? Math.min(1, Math.max(0, 1 - (session.endsAt - now) / total)) : 1
  }
  const completed = pathname === '/adventure/result' && state?.sessionHistory.at(-1)?.status === 'completed'
  const full = FULL_SCENE_ROUTES.includes(pathname) || completed

  // Per-gym painting behind the battle and the screens that follow it. Unknown levels fall back to the meadow.
  let gymLevel: number | undefined
  const battleMatch = matchPath('/battle/:level', pathname)
  if (battleMatch) gymLevel = Number(battleMatch.params.level)
  else if (pathname === '/defeat') gymLevel = (location.state as { gymLevel?: number } | null)?.gymLevel
  else if (pathname === '/lockbox') gymLevel = state?.pendingReward?.gymLevel
  if (gymLevel !== undefined && !getGymBackground(gymLevel)) gymLevel = undefined

  return <SceneBackground tone={full ? 'full' : 'dim'} progress={progress} gymLevel={gymLevel} />
}

export default function AppRoutes() {
  return (
    <HashRouter>
      <OnboardingGuard>
        <SfxSync />
        <SceneLayer />
        <AppShell />
        <AnimatedRoutes />
      </OnboardingGuard>
    </HashRouter>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  // Selecting another Lockling changes the URL, but remains within the Dojo screen.
  const transitionKey = location.pathname.startsWith('/dojo') ? '/dojo' : location.pathname
  const variants: Variants = {
    initial: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.airy } },
    exit: { opacity: 0, y: 0, transition: { duration: 0.15, ease: ease.airy } },
    reducedInitial: { opacity: 0 },
    reducedEnter: { opacity: 1, transition: { duration: 0.2 } },
    reducedExit: { opacity: 0, transition: { duration: 0.2 } },
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        className="min-h-full"
        variants={variants}
        initial={reduceMotion ? 'reducedInitial' : 'initial'}
        animate={reduceMotion ? 'reducedEnter' : 'enter'}
        exit={reduceMotion ? 'reducedExit' : 'exit'}
      >
        <Routes location={location}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/adventure/setup" element={<AdventureSetup />} />
          <Route path="/adventure" element={<AdventureActive />} />
          <Route path="/adventure/result" element={<AdventureResult />} />
          <Route path="/gyms" element={<GymMap />} />
          <Route path="/battle/:level" element={<Battle />} />
          <Route path="/lockbox" element={<Lockbox />} />
          <Route path="/defeat" element={<Defeat />} />
          <Route path="/dojo" element={<Dojo />} />
          <Route path="/dojo/:uid" element={<Dojo />} />
          <Route path="/lockdex" element={<Lockdex />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dev" element={<Dev />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
