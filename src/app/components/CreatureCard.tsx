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
      className={`rounded-card bg-surface p-3 text-left shadow-card min-h-tap ${
        selected ? 'ring-2 ring-primary' : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <div className="font-display">{defId}</div>
      {moveCount != null ? <div className="text-sm text-muted">{moveCount}/4 moves</div> : null}
      {badge ? <div className="text-xs text-primary">{badge}</div> : null}
    </button>
  )
}
