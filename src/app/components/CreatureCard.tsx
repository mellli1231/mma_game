interface CreatureCardProps {
  defId: string
  moveCount?: number
  selected?: boolean
  dimmed?: boolean
  badge?: string
  onClick?: () => void
}

export function CreatureCard({
  defId,
  moveCount,
  selected,
  dimmed,
  badge,
  onClick,
}: CreatureCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focu-card min-h-tap p-4 text-left ${
        selected ? 'creature-card--selected' : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <div className="font-display font-semibold">{defId}</div>
      {moveCount != null ? <div className="text-sm text-muted">{moveCount}/4 moves</div> : null}
      {badge ? <div className="text-xs font-bold text-primary">{badge}</div> : null}
    </button>
  )
}
