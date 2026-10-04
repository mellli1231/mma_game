import type { MoveDef } from '@/types'
import { motion, useReducedMotion } from 'framer-motion'

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
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      disabled={disabled}
      title={disabledReason}
      onClick={onClick}
      whileHover={disabled ? undefined : reduceMotion ? { opacity: 0.9 } : { y: -2, boxShadow: '0 8px 18px rgb(31 32 51 / 18%)' }}
      whileTap={disabled ? undefined : reduceMotion ? { opacity: 0.85 } : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 14 }}
      className={`min-h-tap rounded-card px-3 py-2 text-left text-white ${FILL[move.element]} ${
        disabled ? 'opacity-50' : 'cursor-pointer'
      }`}
    >
      <div className="font-display">{move.name}</div>
      <div className="text-sm">
        {move.effect === 'heal' ? `HEAL ${move.power}` : `ATK ${move.power}`}
        {usesLeft != null ? ` · ${usesLeft} ${move.effect === 'heal' ? 'uses' : 'left'}` : ''}
      </div>
      {effectiveness ? <span className={`move-button__effectiveness move-button__effectiveness--${effectiveness}`}>{effectiveness === 'super' ? 'Super effective' : 'Not very effective'}</span> : null}
    </motion.button>
  )
}
