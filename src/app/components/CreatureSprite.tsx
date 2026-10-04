import type { AnimationEvent, CSSProperties } from 'react'
import type { SpriteState } from '@/types'
import { CREATURES } from '@/data/creatures'

interface CreatureSpriteProps {
  defId: string
  uid?: string
  size?: number
  state?: SpriteState
  facing?: 'left' | 'right'
  showShadow?: boolean
  showParticles?: boolean
  onAnimationEnd?: () => void
}

const ELEMENT_COLOR = {
  fire: '#ff7a45',
  water: '#3ba3ff',
  grass: '#3fbf7f',
} as const

function hashUid(uid: string): number {
  let hash = 0
  for (let index = 0; index < uid.length; index += 1) {
    hash = (hash * 31 + uid.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % 1000
}

export function CreatureSprite({
  defId,
  uid,
  size = 96,
  state = 'idle',
  facing = 'right',
  showShadow = true,
  showParticles = false,
  onAnimationEnd,
}: CreatureSpriteProps) {
  const creature = CREATURES[defId]
  const style = {
    '--sprite-size': `${size}px`,
    '--sprite-element': ELEMENT_COLOR[creature?.element ?? 'grass'],
    '--sprite-delay': `${uid ? hashUid(uid) : 0}ms`,
  } as CSSProperties

  function handleAnimationEnd(event: AnimationEvent<HTMLSpanElement>) {
    const completedAnimation = state === 'hop' || state === 'selected'
      ? 'sprite-hop'
      : state === 'sentOut'
        ? 'sprite-sent-out'
        : undefined
    if (completedAnimation && event.animationName === completedAnimation) onAnimationEnd?.()
  }

  return (
    <div
      className={`creature-sprite creature-sprite--${state}`}
      data-uid={uid}
      data-state={state}
      style={style}
      role="img"
      aria-label={creature?.name ?? defId}
    >
      {showShadow ? <span className="creature-sprite__shadow" aria-hidden="true" /> : null}
      <span className={`creature-sprite__facing creature-sprite__facing--${facing}`}>
        <span className="creature-sprite__motion" onAnimationEnd={handleAnimationEnd}>
          <span className="creature-sprite__body" aria-hidden="true">
            {creature?.emoji ?? '✨'}
          </span>
        </span>
      </span>
      {showParticles ? (
        <span className="creature-sprite__fx" aria-hidden="true">
          <i>✦</i><i>·</i><i>✧</i>
        </span>
      ) : null}
    </div>
  )
}
