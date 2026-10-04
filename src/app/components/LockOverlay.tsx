import type { ReactNode } from 'react'

interface LockOverlayProps {
  locked: boolean
  reason?: string
  children: ReactNode
}

export function LockOverlay({ locked, reason, children }: LockOverlayProps) {
  return (
    <div className="relative">
      {children}
      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-card bg-ink/50 text-center text-surface">
          <div>
            <div aria-hidden="true">🔒</div>
            <div className="font-display">{reason ?? 'Locked'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
