import { motion, useReducedMotion } from 'framer-motion'
import type { LockboxContent, Rarity } from '@/types'
import { CREATURES } from '@/data/creatures'
import { MOVES } from '@/data/moves'

interface RevealCardProps {
  content: LockboxContent
  onContinue?: () => void
}

function contentDetails(content: LockboxContent): { title: string; detail: string; icon: string; rarity: Rarity } {
  if (content.kind === 'creature') {
    const creature = CREATURES[content.creatureId]
    return {
      title: creature ? `New Lockling: ${creature.name}` : 'New Lockling',
      detail: creature ? `${creature.element} · ${creature.rarity}` : content.creatureId,
      icon: creature?.emoji ?? '✨',
      rarity: creature?.rarity ?? 'common',
    }
  }
  if (content.kind === 'move') {
    const move = MOVES[content.moveId]
    return {
      title: move ? `Move Scroll: ${move.name}` : 'Move Scroll',
      detail: move ? `${move.element} · ${move.effect === 'heal' ? `HEAL ${move.power}` : `ATK ${move.power}`}` : content.moveId,
      icon: '📜',
      rarity: move?.rarity ?? 'common',
    }
  }
  return { title: 'Spark Pouch', detail: `+${content.amount} FP`, icon: '🪙', rarity: 'common' }
}

export function RevealCard({ content, onContinue }: RevealCardProps) {
  const reduceMotion = useReducedMotion()
  const details = contentDetails(content)
  return (
    <motion.section
      className={`reveal-card focu-card reveal-card--${details.rarity} p-6 text-center`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 180, damping: 20 }}
      aria-label={`${details.rarity} reward`}
    >
      <div className="reveal-card__icon" aria-hidden="true">{details.icon}</div>
      <p className="font-display text-xl">{details.title}</p>
      <p className="mt-1 text-sm capitalize text-muted">{details.detail}</p>
      <span className={`focu-rarity focu-rarity--${details.rarity} mt-3 uppercase`}>
        {details.rarity}
      </span>
      {onContinue ? (
        <div><button type="button" onClick={onContinue} className="focu-btn focu-btn--primary mt-4">Continue</button></div>
      ) : null}
    </motion.section>
  )
}
