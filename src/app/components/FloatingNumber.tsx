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
  return (
    <span className={`font-display text-xl ${KIND_CLASS[kind]}`} onAnimationEnd={onDone}>
      {kind === 'miss' ? 'MISS' : value}
    </span>
  )
}
