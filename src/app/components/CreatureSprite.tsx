import { useState, type AnimationEvent, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
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

function CreatureArt({ defId, emoji }: { defId: string; emoji: string }) {
  const [available, setAvailable] = useState(true)
  if (!available) return <span className="creature-sprite__emoji" aria-hidden="true">{emoji}</span>
  return (
    <img
      className="creature-sprite__art"
      src={`/assets/creatures/${defId}.png`}
      alt=""
      draggable={false}
      onError={() => setAvailable(false)}
    />
  )
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
  const reduceMotion = useReducedMotion()
  const creature = CREATURES[defId]
  const seed = uid ? hashUid(uid) : hashUid(defId)
  const particleGlyph = creature?.element === 'water' ? '◦' : creature?.element === 'grass' ? '🍃' : '✦'
  const style = {
    '--sprite-size': `${size}px`,
    '--sprite-element': ELEMENT_COLOR[creature?.element ?? 'grass'],
    '--sprite-delay': `${seed}ms`,
    // Tidepup's visible pixels reach the edge of its 512px canvas; the other art has transparent padding.
    '--sprite-art-scale': defId === 'tidepup' ? '0.93' : '1',
  } as CSSProperties

  function handleAnimationEnd(event: AnimationEvent<HTMLSpanElement>) {
    const expected: Partial<Record<SpriteState, string>> = {
      hop: 'sprite-hop', selected: 'sprite-hop', sentOut: 'sprite-sent-out',
      attack: 'sprite-attack', hit: 'sprite-hit', miss: 'sprite-miss',
      heal: 'sprite-heal', zonedOut: 'sprite-zoned-out', celebrate: 'sprite-celebrate',
    }
    if (expected[state] === event.animationName || (reduceMotion && expected[state] && event.animationName === 'reduced-opacity')) {
      onAnimationEnd?.()
    }
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
            <CreatureArt key={defId} defId={defId} emoji={creature?.emoji ?? '✨'} />
          </span>
        </span>
      </span>
      {showParticles ? (
        <span className={`creature-sprite__particles creature-sprite__particles--${creature?.element ?? 'grass'}`} aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => {
            const delay = -((seed + index * 317) % 8000)
            const duration = creature?.element === 'fire'
              ? 4000 + ((seed + index * 173) % 2001)
              : creature?.element === 'water'
                ? 5000 + ((seed + index * 173) % 2001)
                : 6000 + ((seed + index * 173) % 2001)
            return <i key={index} style={{ '--particle-index': index, '--particle-delay': `${delay}ms`, '--particle-duration': `${duration}ms` } as CSSProperties}>{particleGlyph}</i>
          })}
        </span>
      ) : null}
      <span className={`creature-sprite__state-fx creature-sprite__state-fx--${state}`} aria-hidden="true">
        {state === 'miss' ? <i className="creature-sprite__label">MISS</i> : null}
        {state === 'heal' ? <><i className="creature-sprite__label">+25</i>{Array.from({ length: 5 }, (_, index) => <i className="creature-sprite__heal-star" key={index}>✦</i>)}</> : null}
        {state === 'zonedOut' || state === 'sleepy' ? <i className="creature-sprite__zzz">zzz</i> : null}
        {state === 'celebrate' ? Array.from({ length: 5 }, (_, index) => <i className="creature-sprite__celebrate-star" key={index}>✦</i>) : null}
      </span>
    </div>
  )
}
