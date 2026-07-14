import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from '../App'
import { setTransport } from '../core/transport'
import '../styles/index.css'

// 设置 Side Panel 传输层：通过 Chrome 消息协议向 Content Script 发送 API 请求
setTransport(async (path, options) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) {
    throw new Error('未找到活动标签页，请先打开教务系统页面 (iedu.jlu.edu.cn)')
  }

  const response = await chrome.tabs.sendMessage(tab.id, {
    type: 'API_REQUEST',
    path,
    method: options.method,
    body: options.body,
    moduleKey: options.moduleKey,
  })

  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
