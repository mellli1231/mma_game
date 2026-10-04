import type { MoveDef } from '@/types'

interface MoveButtonProps {
  move: MoveDef
  usesLeft?: number
  effectiveness?: 'super' | 'weak' | null
  disabled?: boolean
  disabledReason?: string
  onClick: () => void
}

const FILL: Record<MoveDef['element'], string> = {
  fire: 'bg-fire',
  water: 'bg-water',
  grass: 'bg-grass',
}

export function MoveButton({
  move,
  usesLeft,
  effectiveness,
  disabled,
  disabledReason,
  onClick,
}: MoveButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabledReason}
      onClick={onClick}
      className={`min-h-tap rounded-card px-3 py-2 text-left text-white ${FILL[move.element]} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div className="font-display">{move.name}</div>
      <div className="text-sm">
        {move.effect === 'heal' ? `HEAL ${move.power}` : `ATK ${move.power}`}
        {usesLeft != null ? ` · ${usesLeft} left` : ''}
      </div>
      {effectiveness === 'super' ? <div className="text-xs">Super</div> : null}
      {effectiveness === 'weak' ? <div className="text-xs">Weak</div> : null}
    </button>
  )
}
