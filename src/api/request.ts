/**
 * 统一请求封装
 * - Side Panel 上下文：transport 被覆盖为 Chrome 消息通信
 * - Content Script 上下文：直接使用同源 fetch，403 时自动预热重试
 */

import { warmupModule } from './warmup'
import { transportOverride } from '../core/transport'

const BASE_URL = 'https://iedu.jlu.edu.cn'

interface RequestOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string | URLSearchParams | Record<string, string>
  /** EMAP 模块标识，用于 403 时自动预热（grade / academic） */
  moduleKey?: string
}

/**
 * 发送请求到 EMAP 平台
 */
export async function emapRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // 如果 transport 被覆盖（Side Panel 上下文），使用消息通信
  if (transportOverride) {
    const body = normalizeBody(options.body)
    return transportOverride(path, {
      method: options.method,
      body,
      moduleKey: options.moduleKey,
    }) as Promise<T>
  }

  // Content Script 上下文：直接 fetch
  const { method = 'POST', body, moduleKey } = options

  const headers: Record<string, string> = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
  }

  const bodyStr = normalizeBody(body)
  const url = `${BASE_URL}${path}`

  async function doRequest(): Promise<T> {
    console.log(`[JLU Tool] Request: ${method} ${path}`)
    if (bodyStr) {
      console.log(`[JLU Tool] Body:`, bodyStr.substring(0, 500))
    }

    const response = await fetch(url, {
      method,
      headers,
      body: bodyStr,
      credentials: 'include',
    })

    console.log(`[JLU Tool] Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error(`[JLU Tool] Error response:`, text.substring(0, 500))
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[JLU Tool] Response data:`, JSON.stringify(data).substring(0, 1000))
    return data as T
  }

  // 首次请求
  try {
    return await doRequest()
  } catch (err) {
    // 403 + 有 moduleKey → 预热后重试一次
    if (moduleKey && err instanceof Error && err.message.startsWith('HTTP 403')) {
      console.log(`[JLU Tool] Got 403, warming up module "${moduleKey}" and retrying...`)
      await warmupModule(moduleKey)
      console.log(`[JLU Tool] Retrying request after warmup: ${method} ${path}`)
      return await doRequest()
    }
    throw err
  }
}

function normalizeBody(body: RequestOptions['body']): string | undefined {
  if (!body) return undefined
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  return new URLSearchParams(body).toString()
}

/**
 * 构建 EMAP querySetting 参数
 */
export function buildQuerySetting(conditions: Array<{
  name: string
  value: string | number
  builder?: string
  linkOpt?: string
  caption?: string
  value_display?: string
  builderList?: string
}>): string {
  const settings = conditions.map(c => ({
    name: c.name,
    caption: c.caption || '',
    linkOpt: c.linkOpt || 'AND',
    builderList: c.builderList || '',
    builder: c.builder || 'm_value_equal',
    value: c.value,
    value_display: c.value_display || '',
  }))
  return JSON.stringify(settings)
}
