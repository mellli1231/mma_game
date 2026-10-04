import { SITES } from '../data/sites'
import type { FocusSession } from '../types'
import { isValidHostname } from './domains'

export interface BlockEntry {
  siteId: string // 'custom' for user-added domains
  domains: string[]
  excludedDomains?: string[]
}

export function toBlockEntries(input: Pick<FocusSession, 'siteIds' | 'customDomains'>): BlockEntry[] {
  const entries: BlockEntry[] = []
  for (const id of input.siteIds) {
    const site = SITES[id]
    if (site) entries.push({ siteId: site.id, domains: site.domains, excludedDomains: site.excludedDomains })
  }
  for (const domain of input.customDomains) entries.push({ siteId: 'custom', domains: [domain] })
  return entries
}

export function toRule(entry: BlockEntry, id: number): chrome.declarativeNetRequest.Rule {
  const params = new URLSearchParams({ site: entry.siteId, d: entry.domains[0] })
  return {
    id,
    priority: 1,
    action: {
      type: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
      redirect: { extensionPath: `/blocked.html?${params}` },
    },
    condition: {
      requestDomains: entry.domains,
      ...(entry.excludedDomains?.length ? { excludedRequestDomains: entry.excludedDomains } : {}),
      resourceTypes: ['main_frame' as chrome.declarativeNetRequest.ResourceType],
    },
  }
}

export async function applyBlockRules(entries: BlockEntry[]) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules()
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map(r => r.id),
    addRules: entries.map((e, i) => toRule(e, i + 1)),
  })
}

export async function clearBlockRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules()
  if (existing.length === 0) return
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existing.map(r => r.id) })
}

/** BLK-06: reload open tabs on blocked domains so they hit the block immediately. */
export async function reloadMatchingTabs(entries: BlockEntry[]) {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] })
  for (const tab of tabs) {
    if (tab.id === undefined || !tab.url) continue
    let host: string
    try {
      host = new URL(tab.url).hostname
    } catch {
      continue
    }
    if (!isValidHostname(host)) continue
    const blocked = entries.some(
      e =>
        e.domains.some(d => host === d || host.endsWith('.' + d)) &&
        !(e.excludedDomains ?? []).some(d => host === d || host.endsWith('.' + d)),
    )
    if (blocked) chrome.tabs.reload(tab.id).catch(() => {})
  }
}
