import { Link } from 'react-router-dom'
import { CreatureSprite, ElementBadge, FpBadge, LockOverlay, TimerRing } from '@/app/components'
import BrandLockup from '@/app/BrandLockup'
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
        <div className="flex flex-wrap items-center gap-3">
          {state.settings.demoMode && (
            <span className="focu-badge bg-lavender text-sm">{DEMO_BADGE}</span>
          )}
          <span className="focu-pill">{state.trainerName}</span>
          <FpBadge amount={state.fp} />
          <Link to="/settings" aria-label="Settings" className="focu-round-btn">
            ⚙️
          </Link>
        </div>
        <BrandLockup size="sm" />
      </header>

      <section className="focu-card p-6 text-center">
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
          className="focu-btn focu-btn--primary flex w-full"
        >
          Unclaimed Lockbox!
        </Link>
      )}

      {session ? (
        <div className="space-y-4">
          <div className="focu-card flex items-center justify-between gap-4 bg-lavender p-4 text-ink">
            <div>
              <div className="font-display text-xl font-bold">Adventure in progress</div>
              <Link to="/adventure" className="flex min-h-tap items-center font-bold text-primary underline">View Adventure</Link>
            </div>
            <div className="rounded-full bg-paper">
              <TimerRing startedAt={session.startedAt} endsAt={session.endsAt} size={96} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <LockOverlay locked reason={LOCKED_TOOLTIP}>
              <div className="focu-home-card focu-home-card--battle" title={LOCKED_TOOLTIP}>
                <span className="focu-home-card__icon" aria-hidden="true">⚔️</span>
                <span className="focu-home-card__title">Let’s Battle!</span>
                <span className="focu-home-card__sub">{nextGym}</span>
              </div>
            </LockOverlay>
            <LockOverlay locked reason={LOCKED_TOOLTIP}>
              <div className="focu-home-card focu-home-card--training" title={LOCKED_TOOLTIP}>
                <span className="focu-home-card__icon" aria-hidden="true">🥋</span>
                <span className="focu-home-card__title">Training Centre</span>
                <span className="focu-home-card__sub">Teach new moves with FP</span>
              </div>
            </LockOverlay>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard to="/adventure/setup" title="Go on an Adventure!" subtitle="Block distractions, earn FP" icon="🧭" className="focu-home-card--adventure" />
          <ActionCard to="/gyms" title="Let’s Battle!" subtitle={nextGym} icon="⚔️" className="focu-home-card--battle" />
          <ActionCard to="/dojo" title="Training Centre" subtitle="Teach new moves with FP" icon="🥋" className="focu-home-card--training" />
        </div>
      )}

      <Link to="/lockdex" className="focu-pill mx-auto flex w-fit text-primary underline">Lockdex &amp; Squad</Link>

      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="Focus minutes" value={stats.totalFocusMin} />
        <Stat label="Adventures completed" value={stats.adventuresCompleted} />
        <Stat label="Battles won" value={stats.battlesWon} />
      </dl>
    </main>
  )
}

function ActionCard(props: { to: string; title: string; subtitle: string; icon: string; className: string }) {
  return (
    <Link to={props.to} className={`focu-home-card ${props.className}`}>
      <span className="focu-home-card__icon" aria-hidden="true">{props.icon}</span>
      <span className="focu-home-card__title">{props.title}</span>
      <span className="focu-home-card__sub">{props.subtitle}</span>
    </Link>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="focu-card p-3">
      <dd className="font-display text-xl font-bold tabular-nums">{value}</dd>
      <dt className="text-muted">{label}</dt>
    </div>
  )
}
