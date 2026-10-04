interface LockboxChestProps {
  state: 'closed' | 'shaking' | 'open'
  dimmed?: boolean
  onClick?: () => void
}

const FACE = {
  closed: '📦',
  shaking: '📦',
  open: '✨',
}

export function LockboxChest({ state, dimmed, onClick }: LockboxChestProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-tap rounded-card bg-surface p-6 text-4xl shadow-card ${dimmed ? 'opacity-50' : ''}`}
    >
      <span role="img" aria-label={state}>
        {FACE[state]}
      </span>
    </button>
  )
}
