/**
 * 支持的AI平台类型
 */
export enum Platform {
  CHATGPT = 'chatgpt',
  GEMINI = 'gemini',
  DOUBAO = 'doubao',
  UNKNOWN = 'unknown'
}

/**
 * 检测当前网页所属的AI平台
 */
export function detectPlatform(): Platform {
  const hostname = window.location.hostname

  // ChatGPT
  if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
    return Platform.CHATGPT
  }

  // Gemini
  if (hostname.includes('gemini.google.com')) {
    return Platform.GEMINI
  }

  // 豆包
  if (hostname.includes('doubao.com')) {
    return Platform.DOUBAO
  }

  console.warn('[ChatOutline] 未识别的平台:', hostname)
  return Platform.UNKNOWN
}

/**
 * 获取平台显示名称
 */
export function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    [Platform.CHATGPT]: 'ChatGPT',
    [Platform.GEMINI]: 'Gemini',
    [Platform.DOUBAO]: '豆包',
    [Platform.UNKNOWN]: '未知平台'
  }
  return names[platform]
}
