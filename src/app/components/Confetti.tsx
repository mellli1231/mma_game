interface ConfettiProps {
  fire: boolean
  colors?: string[]
}

export function Confetti({ fire, colors }: ConfettiProps) {
  if (!fire) return null
  return (
    <div aria-hidden="true" className="pointer-events-none text-fp-gold" data-colors={colors?.join(',')}>
      🎉
    </div>
  )
}
