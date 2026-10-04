import type { FpBreakdown } from '@/types'

interface PointsPreviewProps {
  breakdown: FpBreakdown
  nudges?: string[]
}

export function PointsPreview({ breakdown, nudges }: PointsPreviewProps) {
  return (
    <section className="rounded-card bg-surface p-4 shadow-card">
      <div className="text-sm text-muted">
        Base: {breakdown.tierName} · {breakdown.rate} FP/min
      </div>
      <div className="font-display text-3xl text-fp-gold tabular-nums">{breakdown.projectedFp} FP</div>
      {nudges?.map((nudge) => (
        <p key={nudge} className="mt-1 text-sm text-muted">
          {nudge}
        </p>
      ))}
    </section>
  )
}
