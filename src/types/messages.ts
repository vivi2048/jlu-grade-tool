/**
 * Chrome Extension 消息协议类型
 * 定义 Side Panel 与 Content Script 之间的通信格式
 */

/** Side Panel → Content Script 的请求消息 */
export interface ApiRequestMessage {
  type: 'API_REQUEST'
  path: string
  method?: 'GET' | 'POST'
  body?: string
  moduleKey?: string
}

/** Content Script → Side Panel 的响应消息 */
export interface ApiResponseMessage {
  success: true
  data: unknown
}

export interface ApiErrorMessage {
  success: false
  error: string
}

export type ContentMessage = ApiRequestMessage
export type ContentResponse = ApiResponseMessage | ApiErrorMessage
