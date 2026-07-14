/**
 * API 传输层抽象
 * Side Panel 通过 Chrome 消息协议向 Content Script 发送请求
 * Content Script 直接使用同源 fetch
 */

export type TransportFn = (
  path: string,
  options: { method?: 'GET' | 'POST'; body?: string; moduleKey?: string }
) => Promise<unknown>

/** 可被 Side Panel 入口覆盖的传输函数 */
export let transportOverride: TransportFn | null = null

export function setTransport(fn: TransportFn) {
  transportOverride = fn
}
