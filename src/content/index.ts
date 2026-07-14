/**
 * Content Script
 * 注入到 iedu.jlu.edu.cn 页面中
 * 职责：API 请求代理（同源 fetch）+ EMAP 模块预热
 */

import { emapRequest } from '../api/request'
import type { ContentMessage, ApiResponseMessage, ApiErrorMessage } from '../types/messages'

console.log('[JLU Tool] Content script loaded')

// 监听来自 Side Panel 的消息
chrome.runtime.onMessage.addListener(
  (message: ContentMessage, _sender, sendResponse: (response: ApiResponseMessage | ApiErrorMessage) => void) => {
    if (message.type === 'API_REQUEST') {
      handleApiRequest(message)
        .then((data): ApiResponseMessage => ({ success: true, data }))
        .catch((err): ApiErrorMessage => ({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        }))
        .then(sendResponse)
      return true // 保持消息通道开启（异步响应）
    }
    return false
  }
)

/**
 * 处理 API 请求
 * 复用现有的 emapRequest（含 403 自动预热重试逻辑）
 */
async function handleApiRequest(message: ContentMessage): Promise<unknown> {
  console.log(`[JLU Tool] Content: handling ${message.method || 'POST'} ${message.path}`)

  return emapRequest(message.path, {
    method: message.method || 'POST',
    body: message.body,
    moduleKey: message.moduleKey,
  })
}
