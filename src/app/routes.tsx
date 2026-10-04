import { HashRouter, Route, Routes } from 'react-router-dom'
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

// TODO (A4): route guards (ONB-01, RUN-06, locked during Adventure, pendingReward) go here.
export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
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
    </HashRouter>
  )
}
