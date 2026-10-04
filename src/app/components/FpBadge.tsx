interface FpBadgeProps {
  amount: number
  animate?: boolean
}

export function FpBadge({ amount }: FpBadgeProps) {
  return (
    <span className="inline-flex min-h-tap items-center gap-1 rounded-pill bg-fp-gold px-3 font-display text-ink">
      <span aria-hidden="true">🪙</span>
      <span className="tabular-nums">{amount}</span>
    </span>
  )
}
