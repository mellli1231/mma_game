import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}

export function Modal({ open, title, onClose, children, actions }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-md rounded-card bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-display text-xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="text-muted min-h-tap min-w-tap">
            Close
          </button>
        </div>
        <div>{children}</div>
        {actions ? <div className="mt-4 flex justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
