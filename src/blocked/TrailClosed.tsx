import { useEffect, useState } from 'react'
import SceneBackground from '@/app/SceneBackground'
import { Modal } from '@/app/components/Modal'
import { isDomainInSession, isValidHostname } from '@/background/domains'
import { SITES } from '@/data/sites'
import { abandonSession, checkSession, getSession } from '@/platform/session'
import type { FocusSession } from '@/types'

const params = new URLSearchParams(location.search)
const siteId = params.get('site') ?? ''
const rawDomain = (params.get('d') ?? '').toLowerCase()

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const primaryBtn = 'focu-btn focu-btn--primary'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SceneBackground tone="dim" />
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="focu-card flex w-full flex-col items-center gap-4 p-8">{children}</div>
      </main>
    </>
  )
}

export default function TrailClosed() {
  const [session, setSession] = useState<FocusSession | null | undefined>(undefined)
  const [now, setNow] = useState(Date.now())
  const [confirming, setConfirming] = useState(false)
  const [left, setLeft] = useState(false)

  useEffect(() => {
    getSession().then(r => setSession(r?.session ?? null), () => setSession(null))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // When the countdown ends, ask the background to complete the session, then re-read it.
  useEffect(() => {
    if (!session || now < session.endsAt) return
    checkSession().then(r => setSession(r?.session ?? null), () => {})
  }, [session, now])

  if (session === undefined) return <Shell>{null}</Shell>

  // The only places this page navigates: the game, or a domain that passed validation below.
  const safeHost = isValidHostname(rawDomain) ? rawDomain : null

  if (left || !session) {
    return (
      <Shell>
        <div className="text-6xl" aria-hidden>🪧</div>
        <h1 className="focu-title !text-3xl">Your Adventure is over. You’re free to go!</h1>
        {safeHost ? (
          <button type="button" className={primaryBtn} onClick={() => location.assign(`https://${safeHost}`)}>
            Continue to {safeHost}
          </button>
        ) : (
          <p className="text-muted">You can close this tab.</p>
        )}
      </Shell>
    )
  }

  const siteName = SITES[siteId]?.name ?? (safeHost || 'This site')
  // Leaving may only go to a domain in this session's block list.
  const leaveTarget = safeHost && isDomainInSession(session, safeHost) ? safeHost : null

  async function leave() {
    await abandonSession('visited_blocked', siteId || undefined).catch(() => {})
    if (leaveTarget) location.assign(`https://${leaveTarget}`)
    else setLeft(true)
  }

  return (
    <Shell>
      <div className="text-7xl" aria-hidden>🪧</div>
      <h1 className="focu-title">Trail Closed!</h1>
      <p className="text-soft">{siteName} is blocked while you’re on an Adventure.</p>
      <p className="font-display text-xl">
        {formatRemaining(session.endsAt - now)} left · {session.projectedFp} FP on the line
      </p>
      <button type="button" className={primaryBtn} onClick={() => location.assign('index.html#/adventure')}>
        Back to my Adventure
      </button>
      <button type="button" className="focu-link-danger mt-10 min-h-tap" onClick={() => setConfirming(true)}>
        Visit site anyway
      </button>
      <Modal
        open={confirming}
        title="Leave the trail?"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <button type="button" className={primaryBtn} onClick={() => setConfirming(false)}>
              Stay locked in
            </button>
            <button type="button" className="focu-link-danger min-h-tap px-2" onClick={leave}>
              Leave the trail
            </button>
          </>
        }
      >
        <p className="text-left">
          Leave the trail? This Adventure ends now and you’ll earn 0 FP (you’d lose {session.projectedFp} FP).
        </p>
      </Modal>
    </Shell>
  )
}
