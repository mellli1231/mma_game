import type { SpriteState } from '@/types'

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

export function CreatureSprite({
  defId,
  uid,
  size = 96,
  state = 'idle',
  facing = 'right',
}: CreatureSpriteProps) {
  return (
    <div
      data-uid={uid}
      data-state={state}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <span className={facing === 'left' ? '-scale-x-100' : undefined} role="img" aria-label={defId}>
        🐾
      </span>
    </div>
  )
}
