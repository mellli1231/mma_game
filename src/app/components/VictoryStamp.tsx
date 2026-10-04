import { motion, useReducedMotion } from 'framer-motion'

interface VictoryStampProps {
  text?: string
  onDone?: () => void
}

export function VictoryStamp({ text = 'LOCKED IN!', onDone }: VictoryStampProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="victory-stamp"
      role="status"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.4, rotate: -9 }}
      animate={{ opacity: 1, scale: 1, rotate: reduceMotion ? 0 : -5 }}
      transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 320, damping: 14 }}
      onAnimationComplete={onDone}
    >
      {text}
    </motion.div>
  )
}
