import { MAX_CUSTOM_DOMAINS } from '../data/config'
import { SITES } from '../data/sites'
import type { FocusSession } from '../types'

export const DOMAIN_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/

/** True for a plain hostname such as "instagram.com". Rejects IPs, localhost, paths and ports. */
export function isValidHostname(host: string): boolean {
  if (host.length > 253 || host === 'localhost' || !DOMAIN_REGEX.test(host)) return false
  const labels = host.split('.')
  return !/^\d+$/.test(labels[labels.length - 1]) // IPv4 addresses end in a number
}

/** Normalizes user input to a bare hostname, or null if it cannot be one (SPEC 9.6). */
export function normalizeDomain(input: string): string | null {
  let d = input.trim().toLowerCase()
  const scheme = d.match(/^([a-z][a-z0-9+.-]*):/)
  if (scheme) {
    if (!/^https?:\/\//.test(d)) return null // chrome:, chrome-extension:, file:, javascript:, ...
    d = d.replace(/^https?:\/\//, '')
  }
  d = d.split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '').replace(/^www\./, '')
  return isValidHostname(d) ? d : null
}

/** Maps a hostname to the catalog site that already covers it, if any. */
export function catalogSiteForDomain(domain: string): string | null {
  for (const site of Object.values(SITES)) {
    if (site.domains.some(d => domain === d || domain.endsWith('.' + d))) return site.id
  }
  return null
}

/** Every hostname blocked by a session: catalog domains of its sites plus its custom domains. */
export function sessionDomains(session: Pick<FocusSession, 'siteIds' | 'customDomains'>): string[] {
  const catalog = session.siteIds.flatMap(id => SITES[id]?.domains ?? [])
  return [...catalog, ...session.customDomains]
}

export function isDomainInSession(session: Pick<FocusSession, 'siteIds' | 'customDomains'>, host: string): boolean {
  return sessionDomains(session).some(d => host === d || host.endsWith('.' + d))
}

export function checkCustomDomains(inputs: string[]): { ok: true; customDomains: string[]; extraSiteIds: string[] } | { ok: false } {
  if (inputs.length > MAX_CUSTOM_DOMAINS) return { ok: false }
  const customDomains: string[] = []
  const extraSiteIds: string[] = []
  for (const raw of inputs) {
    const domain = normalizeDomain(String(raw))
    if (!domain) return { ok: false }
    const siteId = catalogSiteForDomain(domain)
    if (siteId) extraSiteIds.push(siteId)
    else if (!customDomains.includes(domain)) customDomains.push(domain)
  }
  return { ok: true, customDomains, extraSiteIds }
}
