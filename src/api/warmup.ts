/**
 * EMAP 模块预热
 * 
 * EMAP 平台要求用户先进入对应模块页面才能调用该模块的 API。
 * 此模块通过创建隐藏 iframe 加载模块入口页面来初始化服务端会话状态，
 * 使后续的 API 请求不再返回 403。
 */

const BASE_URL = 'https://iedu.jlu.edu.cn'

/** 模块入口页面 URL 映射 */
const MODULE_PAGES: Record<string, string> = {
  grade: `${BASE_URL}/jwapp/sys/cjcx/*default/index.do?THEME=indigo&EMAP_LANG=zh`,
  academic: `${BASE_URL}/jwapp/sys/xywccx/*default/index.do?THEME=indigo&EMAP_LANG=zh`,
}

/** 已预热的模块缓存（session 级别） */
const warmedUp = new Set<string>()

/** 预热超时时间（毫秒） */
const WARMUP_TIMEOUT = 8000

/**
 * 预热指定模块
 * 创建隐藏 iframe 加载模块入口页面，等待页面加载完成后移除 iframe。
 * 同一模块在同一会话中只预热一次。
 */
export function warmupModule(moduleKey: string): Promise<void> {
  // 已预热过，直接返回
  if (warmedUp.has(moduleKey)) {
    console.log(`[JLU Tool] Module "${moduleKey}" already warmed up, skipping`)
    return Promise.resolve()
  }

  const moduleUrl = MODULE_PAGES[moduleKey]
  if (!moduleUrl) {
    console.warn(`[JLU Tool] Unknown module key: "${moduleKey}", cannot warmup`)
    return Promise.resolve()
  }

  console.log(`[JLU Tool] Warming up module: ${moduleKey} → ${moduleUrl}`)

  return new Promise<void>((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.className = 'jlu-warmup-iframe'
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;opacity:0;pointer-events:none;'
    iframe.setAttribute('aria-hidden', 'true')

    let resolved = false
    const cleanup = () => {
      if (resolved) return
      resolved = true
      warmedUp.add(moduleKey)
      iframe.remove()
      console.log(`[JLU Tool] Module "${moduleKey}" warmed up successfully`)
      resolve()
    }

    // 超时处理
    const timer = setTimeout(() => {
      if (!resolved) {
        console.log(`[JLU Tool] Module "${moduleKey}" warmup timed out after ${WARMUP_TIMEOUT}ms, proceeding anyway`)
        cleanup()
      }
    }, WARMUP_TIMEOUT)

    iframe.onload = () => {
      clearTimeout(timer)
      // 给 EMAP 平台一点时间完成 session 初始化
      setTimeout(cleanup, 500)
    }

    iframe.onerror = () => {
      clearTimeout(timer)
      console.warn(`[JLU Tool] Module "${moduleKey}" warmup iframe error, proceeding anyway`)
      // 即使加载失败也标记为已尝试，避免反复重试
      warmedUp.add(moduleKey)
      iframe.remove()
      resolve()
    }

    iframe.src = moduleUrl
    document.body.appendChild(iframe)
  })
}

/**
 * 检查模块是否已预热
 */
export function isModuleWarmedUp(moduleKey: string): boolean {
  return warmedUp.has(moduleKey)
}

/**
 * 清除预热缓存（用于测试或 session 过期后强制重新预热）
 */
export function clearWarmupCache(moduleKey?: string): void {
  if (moduleKey) {
    warmedUp.delete(moduleKey)
    console.log(`[JLU Tool] Cleared warmup cache for module: ${moduleKey}`)
  } else {
    warmedUp.clear()
    console.log(`[JLU Tool] Cleared all warmup cache`)
  }
}
