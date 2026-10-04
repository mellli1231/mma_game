interface HpBarProps {
  hp: number
  maxHp?: number
  showNumber?: boolean
}

export function HpBar({ hp, maxHp = 100, showNumber = true }: HpBarProps) {
  const ratio = maxHp <= 0 ? 0 : Math.max(0, Math.min(1, hp / maxHp))
  const tone = hp <= 20 ? 'bg-hp-low' : hp <= 50 ? 'bg-hp-mid' : 'bg-hp-high'
  return (
    <div className="w-full">
      <div className="h-3 overflow-hidden rounded-pill bg-ring-track">
        <div className={`h-full ${tone}`} style={{ width: `${ratio * 100}%` }} />
      </div>
      {showNumber ? (
        <div className="mt-1 font-display text-sm tabular-nums">
          {hp}/{maxHp}
        </div>
      ) : null}
    </div>
  )
}
