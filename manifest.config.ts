import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Focu',
  version: '0.1.0',
  description: 'Lock in. Level up. Turn focus time into power for your creatures.',
  action: { default_title: 'Open Focu' },
  background: { service_worker: 'src/background/index.ts', type: 'module' },
  permissions: ['storage', 'alarms', 'declarativeNetRequest', 'notifications', 'tabs'],
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [{ resources: ['blocked.html', 'assets/*'], matches: ['<all_urls>'] }],
  icons: { '16': 'icon16.png', '48': 'icon48.png', '128': 'icon128.png' },
})
