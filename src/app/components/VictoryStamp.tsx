interface VictoryStampProps {
  text?: string
  onDone?: () => void
}

export function VictoryStamp({ text = 'LOCKED IN!', onDone }: VictoryStampProps) {
  return (
    <div className="font-display text-4xl text-primary" onAnimationEnd={onDone}>
      {text}
    </div>
  )
}
