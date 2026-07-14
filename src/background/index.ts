/**
 * Background Service Worker
 * 管理 Side Panel 生命周期：仅在 iedu.jlu.edu.cn 页面生效
 */

const TARGET_HOST = 'iedu.jlu.edu.cn'

function isTargetUrl(url?: string): boolean {
  if (!url) return false
  try {
    return new URL(url).hostname === TARGET_HOST
  } catch {
    return false
  }
}

// 点击扩展图标：仅在目标页面打开 Side Panel
chrome.action.onClicked.addListener(async (tab) => {
  if (isTargetUrl(tab.url) && tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id })
  }
})

// 切换标签页时：非目标页面显示占位页
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId)
  if (!isTargetUrl(tab.url)) {
    // 显示友好的占位页面
    await chrome.sidePanel.setOptions({ tabId, path: 'placeholder.html' }).catch(() => {})
  } else {
    await chrome.sidePanel.setOptions({ tabId, path: 'sidepanel.html' }).catch(() => {})
  }
})

// 页面导航时：URL 变化后检查是否需要切换面板
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    if (!isTargetUrl(tab.url)) {
      await chrome.sidePanel.setOptions({ tabId, path: 'placeholder.html' }).catch(() => {})
    } else {
      await chrome.sidePanel.setOptions({ tabId, path: 'sidepanel.html' }).catch(() => {})
    }
  }
})

// 默认行为：点击图标打开（而非自动显示）
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(console.error)
