import { Link } from 'react-router-dom'
import { CreatureSprite, ElementBadge, FpBadge, LockOverlay, TimerRing } from '@/app/components'
import { useGameState } from '@/app/store'
import { CREATURES } from '@/data/creatures'
import { GYMS } from '@/data/gyms'

// Demo Mode runs sessions at 60x (SPEC 6.12).
const DEMO_BADGE = 'DEMO 60x'
const LOCKED_TOOLTIP = 'Locked while you’re on an Adventure'

export default function Home() {
  const state = useGameState()
  if (!state) return null

  const squad = state.squad
    .map(uid => state.creatures.find(c => c.uid === uid))
    .filter(c => c !== undefined)
  const gym = GYMS[state.currentGymLevel]
  const nextGym = gym ? `Next: Gym ${gym.level} · ${gym.name}` : 'All gyms cleared'
  const session = state.activeSession
  const { stats } = state

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      <header className="flex items-center justify-between gap-3">
        <span className="font-display text-2xl text-primary">Locklings</span>
        <div className="flex items-center gap-3">
          {state.settings.demoMode && (
            <span className="rounded-pill bg-primary px-3 py-1 text-xs font-display text-white">{DEMO_BADGE}</span>
          )}
          <span className="text-muted">{state.trainerName}</span>
          <FpBadge amount={state.fp} />
          <Link to="/settings" aria-label="Settings" className="flex min-h-tap min-w-tap items-center justify-center">
            ⚙️
          </Link>
        </div>
      </header>

      <section className="rounded-card bg-surface p-6 text-center shadow-card">
        <h1 className="font-display text-3xl">Welcome back, {state.trainerName}!</h1>
        <div className="mt-4 flex justify-center gap-6">
          {squad.map(c => (
            <div key={c.uid} className="flex flex-col items-center gap-1">
              <CreatureSprite defId={c.defId} uid={c.uid} size={96} />
              <ElementBadge element={CREATURES[c.defId].element} size="sm" />
            </div>
          ))}
        </div>
      </section>

      {state.pendingReward && (
        <Link
          to="/lockbox"
          className="block min-h-tap rounded-card bg-fp-gold p-3 text-center font-display shadow-card"
        >
          Unclaimed Lockbox!
        </Link>
      )}

      {session ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-card bg-primary p-4 text-white shadow-card">
            <div>
              <div className="font-display text-xl">Adventure in progress</div>
              <Link to="/adventure" className="flex min-h-tap items-center underline">View Adventure</Link>
            </div>
            <div className="rounded-full bg-surface">
              <TimerRing startedAt={session.startedAt} endsAt={session.endsAt} size={96} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <LockOverlay locked reason={LOCKED_TOOLTIP}>
              <div className="min-h-tap rounded-card bg-fire p-5 text-white shadow-card" title={LOCKED_TOOLTIP}>
                <div className="font-display text-xl">Let’s Battle!</div>
                <div className="text-sm opacity-90">{nextGym}</div>
              </div>
            </LockOverlay>
            <LockOverlay locked reason={LOCKED_TOOLTIP}>
              <div className="min-h-tap rounded-card bg-grass p-5 text-white shadow-card" title={LOCKED_TOOLTIP}>
                <div className="font-display text-xl">Training Centre</div>
                <div className="text-sm opacity-90">Teach new moves with FP</div>
              </div>
            </LockOverlay>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard to="/adventure/setup" title="Go on an Adventure!" subtitle="Block distractions, earn FP" className="bg-primary" />
          <ActionCard to="/gyms" title="Let’s Battle!" subtitle={nextGym} className="bg-fire" />
          <ActionCard to="/dojo" title="Training Centre" subtitle="Teach new moves with FP" className="bg-grass" />
        </div>
      )}

      <Link to="/lockdex" className="block text-center text-primary underline">Lockdex &amp; Squad</Link>

      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="Focus minutes" value={stats.totalFocusMin} />
        <Stat label="Adventures completed" value={stats.adventuresCompleted} />
        <Stat label="Battles won" value={stats.battlesWon} />
      </dl>
    </main>
  )
}

function ActionCard(props: { to: string; title: string; subtitle: string; className: string }) {
  return (
    <Link
      to={props.to}
      className={`min-h-tap rounded-card p-5 text-white shadow-card transition-transform duration-micro ease-airy hover:-translate-y-0.5 motion-reduce:transition-none ${props.className}`}
    >
      <div className="font-display text-xl">{props.title}</div>
      <div className="text-sm opacity-90">{props.subtitle}</div>
    </Link>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card bg-surface p-3 shadow-card">
      <dd className="font-display text-xl">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  )
}
