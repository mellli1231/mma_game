import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Modal, PointsPreview } from '@/app/components'
import { useGameState } from '@/app/store'
import { normalizeDomain, catalogSiteForDomain } from '@/background/domains'
import { SESSION_MAX_MIN, SESSION_MIN_MIN, SESSION_MIN_MIN_DEMO } from '@/background/constants'
import { FP_TIERS, MAX_CUSTOM_DOMAINS } from '@/data/config'
import { SITE_CATEGORIES, SITES } from '@/data/sites'
import { calculateFp } from '@/engine/points'
import { platform } from '@/platform/platform'

const PRESETS = [25, 45, 60, 90, 120]
const DEFAULT_MINUTES = 25
const SLIDER_STEP = 5
const SLIDER_STEP_DEMO = 1
const TIER_NUDGE_WINDOW = 5

const formatMultiplier = (m: number) => `x${m.toFixed(m % 1 === 0 ? 1 : 2)}`

const START_ERRORS: Record<string, string> = {
  INVALID_DURATION: 'Pick a duration within the slider range.',
  NO_SITES: 'Pick at least one site to block.',
  INVALID_DOMAIN: 'One of your custom domains is not valid.',
}

export default function AdventureSetup() {
  const state = useGameState()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const demo = state?.settings.demoMode ?? false
  const minMinutes = demo ? SESSION_MIN_MIN_DEMO : SESSION_MIN_MIN
  const step = demo ? SLIDER_STEP_DEMO : SLIDER_STEP

  const [minutes, setMinutes] = useState(() => {
    const requested = Number(params.get('minutes'))
    const wanted = requested > 0 ? requested : state?.lastAdventureSetup?.durationMin ?? DEFAULT_MINUTES
    return Math.min(SESSION_MAX_MIN, Math.max(minMinutes, Math.round(wanted)))
  })
  const [siteIds, setSiteIds] = useState<string[]>(() => state?.lastAdventureSetup?.siteIds ?? [])
  const [customDomains, setCustomDomains] = useState<string[]>(() => state?.lastAdventureSetup?.customDomains ?? [])
  const [domainInput, setDomainInput] = useState('')
  const [domainError, setDomainError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [startError, setStartError] = useState('')

  const breakdown = useMemo(() => calculateFp(minutes, siteIds), [minutes, siteIds])

  const nudges = useMemo(() => {
    const result: string[] = []
    for (const category of SITE_CATEGORIES) {
      const count = siteIds.filter(id => SITES[id]?.categoryId === category.id).length
      if (count === category.threshold - 1) {
        result.push(`Block 1 more ${category.name} site to unlock ${formatMultiplier(category.multiplier)}`)
      }
    }
    FP_TIERS.forEach((tier, i) => {
      const next = FP_TIERS[i + 1]
      if (next && minutes >= tier.maxMin - TIER_NUDGE_WINDOW && minutes <= tier.maxMin) {
        result.push(`Add ${tier.maxMin + 1 - minutes} min to reach ${next.name} (${next.rate} FP/min)`)
      }
    })
    return result
  }, [siteIds, minutes])

  if (!state) return null

  const blockedCount = siteIds.length + customDomains.length
  const canStart = blockedCount > 0 && minutes >= minMinutes && minutes <= SESSION_MAX_MIN

  const toggleSite = (id: string) =>
    setSiteIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))

  const toggleCategory = (categoryId: string) => {
    const ids = Object.values(SITES).filter(s => s.categoryId === categoryId).map(s => s.id)
    setSiteIds(current =>
      ids.every(id => current.includes(id))
        ? current.filter(id => !ids.includes(id))
        : [...current, ...ids.filter(id => !current.includes(id))],
    )
  }

  const addDomain = () => {
    const domain = normalizeDomain(domainInput)
    if (!domain) return setDomainError('Enter a site like example.com')
    const catalogId = catalogSiteForDomain(domain)
    if (catalogId) {
      setSiteIds(ids => (ids.includes(catalogId) ? ids : [...ids, catalogId]))
    } else if (customDomains.includes(domain)) {
      return setDomainError('Already added')
    } else if (customDomains.length >= MAX_CUSTOM_DOMAINS) {
      return setDomainError(`You can add up to ${MAX_CUSTOM_DOMAINS} custom sites`)
    } else {
      setCustomDomains(list => [...list, domain])
    }
    setDomainInput('')
    setDomainError('')
  }

  const lockIn = async () => {
    setBusy(true)
    setStartError('')
    const result = await platform.startSession({ durationMin: minutes, siteIds, customDomains })
    if (result.ok || result.error === 'ALREADY_ACTIVE') {
      navigate('/adventure', { replace: true })
      return
    }
    setBusy(false)
    setConfirmOpen(false)
    setStartError(START_ERRORS[result.error] ?? 'Could not start the Adventure. Please try again.')
  }

  const tier = breakdown.tierName

  return (
    <main className="mx-auto max-w-5xl p-4 pb-80 lg:pb-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="focu-title focu-panel px-5 py-1">Plan your Adventure</h1>
        <Link to="/" className="focu-pill text-primary underline">Back</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="focu-card p-5">
            <h2 className="focu-tag mb-3 bg-lavender">How long?</h2>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={minutes === p}
                  onClick={() => setMinutes(p)}
                  className="focu-chip"
                >
                  {p} min
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm text-muted" htmlFor="duration">
              {minutes} minutes
            </label>
            <input
              id="duration"
              type="range"
              className="w-full accent-primary"
              min={minMinutes}
              max={SESSION_MAX_MIN}
              step={step}
              value={minutes}
              onChange={e => setMinutes(Number(e.target.value))}
            />
            <span className="focu-badge focu-badge--grass mt-2">
              {tier} · {breakdown.rate} FP/min
            </span>
          </section>

          <section className="space-y-3">
            <h2 className="focu-tag bg-fire">What to block?</h2>
            {SITE_CATEGORIES.map((category, index) => {
              const sites = Object.values(SITES).filter(s => s.categoryId === category.id)
              const count = sites.filter(s => siteIds.includes(s.id)).length
              const active = count >= category.threshold
              const fill = Math.min(1, count / category.threshold)
              return (
                <details key={category.id} open={index === 0} className="focu-card p-5">
                  <summary className="flex min-h-tap cursor-pointer flex-wrap items-center gap-2">
                    <span aria-hidden="true">{category.icon}</span>
                    <span className="font-display font-semibold">{category.name}</span>
                    <span className="text-sm text-muted">
                      {formatMultiplier(category.multiplier)} · {count}/{category.threshold} selected
                    </span>
                    <span className="h-3 w-20 overflow-hidden rounded-pill border-2 border-ink bg-mint-pale" aria-hidden="true">
                      <span
                        className={`block h-full origin-left rounded-pill transition-transform duration-short ease-airy motion-reduce:transition-none ${active ? 'bg-sunshine-deep' : 'bg-primary'}`}
                        style={{ transform: `scaleX(${fill})`, width: '100%' }}
                      />
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sites.map(site => {
                      const on = siteIds.includes(site.id)
                      return (
                        <button
                          key={site.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleSite(site.id)}
                          className="focu-chip"
                        >
                          {site.emoji} {site.name}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="min-h-tap px-3 text-sm text-primary underline"
                    >
                      {count === sites.length ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                </details>
              )
            })}
          </section>

          <section className="focu-card p-5">
            <h2 className="focu-tag mb-2 bg-water">Other sites</h2>
            <p className="mb-3 text-sm text-muted">
              Custom sites are blocked too, but never count toward a bonus. Up to {MAX_CUSTOM_DOMAINS}.
            </p>
            <form
              className="flex gap-2"
              onSubmit={e => {
                e.preventDefault()
                addDomain()
              }}
            >
              <input
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                placeholder="example.com"
                aria-label="Custom site"
                className="focu-input flex-1"
              />
              <button type="submit" className="focu-btn focu-btn--primary !min-h-[44px] !px-5 !text-lg">Add</button>
            </form>
            {domainError && <p role="alert" className="mt-2 text-sm text-danger">{domainError}</p>}
            {customDomains.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {customDomains.map(d => (
                  <li key={d}>
                    <button
                      type="button"
                      aria-label={`Remove ${d}`}
                      onClick={() => setCustomDomains(list => list.filter(x => x !== d))}
                      className="focu-chip"
                    >
                      {d} ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="fixed inset-x-0 bottom-0 z-10 max-h-[45vh] space-y-3 overflow-y-auto border-t-[2.5px] border-ink bg-paper p-3 lg:sticky lg:top-4 lg:max-h-none lg:self-start lg:overflow-visible lg:border-t-0 lg:bg-transparent lg:p-0">
          <PointsPreview breakdown={breakdown} nudges={nudges} />
          {startError && <p role="alert" className="text-sm text-danger">{startError}</p>}
          <button
            type="button"
            disabled={!canStart}
            onClick={() => setConfirmOpen(true)}
            className="focu-btn focu-btn--primary w-full"
          >
            Start Adventure
          </button>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        title="Ready to lock in?"
        onClose={() => setConfirmOpen(false)}
        actions={
          <>
            <button type="button" disabled={busy} onClick={() => setConfirmOpen(false)} className="min-h-tap px-4 font-display font-semibold text-primary underline">
              Back
            </button>
            <button type="button" disabled={busy} onClick={lockIn} className="focu-btn focu-btn--primary">
              Lock in!
            </button>
          </>
        }
      >
        <p>
          {minutes} min · {blockedCount} {blockedCount === 1 ? 'site' : 'sites'} blocked
        </p>
        <p className="my-2 font-display text-2xl font-bold text-ink">{breakdown.projectedFp} FP</p>
        <p className="text-sm text-muted">Leaving the trail early forfeits this Adventure’s FP.</p>
      </Modal>
    </main>
  )
}
