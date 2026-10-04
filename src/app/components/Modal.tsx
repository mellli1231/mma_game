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
    <div className="focu-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="focu-modal w-full max-w-md">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="focu-modal__title">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="min-h-tap min-w-tap font-display font-semibold text-muted underline">
            Close
          </button>
        </div>
        <div className="text-soft">{children}</div>
        {actions ? <div className="mt-5 flex flex-wrap items-center justify-end gap-4">{actions}</div> : null}
      </div>
    </div>
  )
}
