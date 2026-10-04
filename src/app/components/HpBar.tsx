import { useEffect, useState } from 'react'

interface HpBarProps {
  hp: number
  maxHp?: number
  showNumber?: boolean
}

export function HpBar({ hp, maxHp = 100, showNumber = true }: HpBarProps) {
  const ratio = maxHp <= 0 ? 0 : Math.max(0, Math.min(1, hp / maxHp))
  const [ghostRatio, setGhostRatio] = useState(ratio)
  useEffect(() => {
    if (ratio >= ghostRatio) {
      setGhostRatio(ratio)
      return
    }
    const timeout = window.setTimeout(() => setGhostRatio(ratio), 300)
    return () => window.clearTimeout(timeout)
  }, [ratio, ghostRatio])
  const tone = hp <= 20 ? 'hp-bar__front--low' : hp <= 50 ? 'hp-bar__front--mid' : ''
  return (
    <div className="w-full">
      <div className="hp-bar relative h-6 overflow-hidden rounded-pill">
        <div className="hp-bar__ghost" style={{ width: `${ghostRatio * 100}%` }} aria-hidden="true" />
        <div className={`hp-bar__front ${tone}`} style={{ width: `${ratio * 100}%` }} />
      </div>
      {showNumber ? (
        <div className="mt-1 font-display text-base font-semibold tabular-nums">
          {hp}/{maxHp}
        </div>
      ) : null}
    </div>
  )
}
