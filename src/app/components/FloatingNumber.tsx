import { motion, useReducedMotion } from 'framer-motion'

interface FloatingNumberProps {
  value: string
  kind: 'damage' | 'heal' | 'miss'
  onDone?: () => void
}

const KIND_CLASS = {
  damage: 'text-danger',
  heal: 'text-grass',
  miss: 'text-muted',
}

export function FloatingNumber({ value, kind, onDone }: FloatingNumberProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.span
      className={`pointer-events-none inline-block font-display text-xl ${KIND_CLASS[kind]}`}
      initial={{ opacity: 0, y: 0, scale: 0.9 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: -24, scale: 1 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
    >
      {kind === 'miss' ? 'MISS' : value}
    </motion.span>
  )
}
