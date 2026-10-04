import { motion, useReducedMotion } from 'framer-motion'

interface LockboxChestProps {
  state: 'closed' | 'shaking' | 'open'
  dimmed?: boolean
  onClick?: () => void
}

const FACE = { closed: '📦', shaking: '📦', open: '✨' } as const

export function LockboxChest({ state, dimmed = false, onClick }: LockboxChestProps) {
  const reduceMotion = useReducedMotion()
  const canPick = state === 'closed' && Boolean(onClick) && !dimmed
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!canPick}
      aria-label={state === 'open' ? 'Opened Lockbox' : state === 'shaking' ? 'Opening Lockbox' : 'Choose this Lockbox'}
      aria-busy={state === 'shaking'}
      whileHover={canPick && !reduceMotion ? { y: -6 } : undefined}
      whileTap={canPick && !reduceMotion ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 14 }}
      className={`lockbox-chest focu-card relative grid min-h-28 min-w-28 place-items-center bg-mint-pale p-6 text-5xl ${dimmed ? 'opacity-50' : ''} lockbox-chest--${state}`}
    >
      <span className={`lockbox-chest__rays ${state === 'open' ? 'lockbox-chest__rays--active' : ''}`} aria-hidden="true" />
      <span className={`lockbox-chest__face ${reduceMotion ? 'lockbox-chest__face--reduced' : ''}`} role="img" aria-hidden="true">
        {FACE[state]}
      </span>
      {state === 'open' ? <span className="sr-only">Lockbox opened</span> : null}
    </motion.button>
  )
}
