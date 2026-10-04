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
        <div className="absolute inset-0 flex items-center justify-center rounded-card border-[2.5px] border-dashed border-[#7c7a99] bg-disabled/90 text-center text-ink">
          <div>
            <div aria-hidden="true">🔒</div>
            <div className="font-display font-semibold">{reason ?? 'Locked'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
