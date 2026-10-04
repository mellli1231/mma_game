import { useEffect, useState } from 'react'

let notify: ((message: string) => void) | null = null

export function useToast() {
  return {
    toast(message: string) {
      notify?.(message)
    },
  }
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    notify = (next) => {
      setMessage(next)
      window.setTimeout(() => setMessage(null), 2500)
    }
    return () => {
      notify = null
    }
  }, [])

  if (!message) return null
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-card bg-ink px-4 py-2 text-surface shadow-card">
      {message}
    </div>
  )
}
