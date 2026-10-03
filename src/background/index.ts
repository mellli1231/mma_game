// Toolbar icon opens the game in a tab, or focuses an existing one.
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('index.html')
  const [existing] = await chrome.tabs.query({ url })
  if (existing?.id !== undefined) {
    await chrome.tabs.update(existing.id, { active: true })
    await chrome.windows.update(existing.windowId, { focused: true })
  } else {
    await chrome.tabs.create({ url })
  }
})
