import type { FpBreakdown } from '@/types'
import { SITE_CATEGORIES } from '@/data/sites'

interface PointsPreviewProps {
  breakdown: FpBreakdown
  nudges?: string[]
}

export function PointsPreview({ breakdown, nudges }: PointsPreviewProps) {
  const bonuses = breakdown.activated.map((id) => SITE_CATEGORIES.find((category) => category.id === id))
  return (
    <section className="rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3 text-sm text-muted">
        <span>Base · {breakdown.tierName}</span>
        <span className="tabular-nums">{breakdown.baseFp} FP</span>
      </div>
      <p className="mb-3 text-xs text-muted">{breakdown.rate} FP/min</p>
      {bonuses.length > 0 ? (
        <ul className="mb-3 space-y-1 border-b border-ink/10 pb-3 text-sm">
          {bonuses.map((category, index) => (
            <li key={`${breakdown.activated[index]}-${index}`} className="flex justify-between gap-3">
              <span>{category ? `${category.icon} ${category.name}` : breakdown.activated[index]}</span>
              <span className="font-semibold tabular-nums">×{category?.multiplier ?? '—'}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>Total multiplier</span>
        <span className="font-semibold tabular-nums">×{breakdown.multiplier.toFixed(2)}{breakdown.capped ? ' (max)' : ''}</span>
      </div>
      {breakdown.capped ? (
        <p className="mb-2 text-xs text-muted">Capped at ×2.5 (before cap: ×{breakdown.rawMultiplier.toFixed(2)})</p>
      ) : null}
      <div className="text-xs font-bold uppercase tracking-wide text-muted">Projected FP</div>
      <div className="font-display text-3xl text-fp-gold-ink tabular-nums">{breakdown.projectedFp} FP</div>
      {nudges?.map((nudge) => (
        <p key={nudge} className="mt-1 text-sm text-muted">
          {nudge}
        </p>
      ))}
    </section>
  )
}
