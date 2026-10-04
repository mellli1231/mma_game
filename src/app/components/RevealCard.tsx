import type { LockboxContent } from '@/types'

interface RevealCardProps {
  content: LockboxContent
  onContinue?: () => void
}

function label(content: LockboxContent): string {
  if (content.kind === 'creature') return `New Lockling: ${content.creatureId}`
  if (content.kind === 'move') return `Move scroll: ${content.moveId}`
  return `Spark Pouch: ${content.amount} FP`
}

export function RevealCard({ content, onContinue }: RevealCardProps) {
  return (
    <div className="rounded-card bg-surface p-6 text-center shadow-card">
      <p className="font-display text-xl">{label(content)}</p>
      {onContinue ? (
        <button type="button" onClick={onContinue} className="mt-4 min-h-tap rounded-pill bg-primary px-4 text-white">
          Continue
        </button>
      ) : null}
    </div>
  )
}
