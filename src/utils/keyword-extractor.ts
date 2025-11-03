/**
 * 从文本中提取关键词作为标题
 * @param text 原始文本
 * @param maxLength 最大长度
 */
export function extractKeywords(text: string, maxLength: number = 30): string {
  if (!text || text.trim().length === 0) {
    return '(空消息)'
  }

  // 移除多余的空白字符
  let cleaned = text.trim().replace(/\s+/g, ' ')

  // 移除代码块标记
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '[代码]')
  cleaned = cleaned.replace(/`[^`]+`/g, '[代码]')

  // 移除Markdown格式
  cleaned = cleaned.replace(/[#*_~\[\]()]/g, '')

  // 移除特殊字符
  cleaned = cleaned.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s,.?!，。？！]/g, '')

  // 提取第一句话或第一行
  const firstLine = cleaned.split(/[。！？\n]/)[0]

  // 如果第一句话太短，尝试获取更多内容
  let result = firstLine.trim()
  if (result.length < 10 && cleaned.length > firstLine.length) {
    result = cleaned.substring(0, maxLength)
  }

  // 截断到最大长度
  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...'
  }

  // 如果提取后为空，返回截断的原始文本
  if (result.length === 0) {
    result = text.substring(0, maxLength)
  }

  return result || '(无标题)'
}

/**
 * 检测文本是否主要是代码
 */
export function isCodeContent(text: string): boolean {
  const codeIndicators = [
    /```/g,
    /function\s+\w+\s*\(/g,
    /const\s+\w+\s*=/g,
    /let\s+\w+\s*=/g,
    /var\s+\w+\s*=/g,
    /class\s+\w+/g,
    /import\s+.*from/g,
    /export\s+(default|const|function)/g
  ]

  let matchCount = 0
  for (const pattern of codeIndicators) {
    if (pattern.test(text)) {
      matchCount++
    }
  }

  return matchCount >= 2
}
