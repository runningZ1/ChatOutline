import { Platform } from '../utils/platform-detector'
import { extractKeywords } from '../utils/keyword-extractor'

/**
 * 对话消息项
 */
export interface MessageItem {
  id: string
  text: string
  title: string
  element: HTMLElement
  timestamp?: number
}

/**
 * 平台解析器接口
 */
interface PlatformParser {
  getUserMessages(): MessageItem[]
  observeChanges(callback: () => void): MutationObserver
}

/**
 * ChatGPT 解析器
 */
class ChatGPTParser implements PlatformParser {
  getUserMessages(): MessageItem[] {
    const messages: MessageItem[] = []

    // ChatGPT 使用 data-message-author-role="user" 标识用户消息
    const userMessages = document.querySelectorAll('[data-message-author-role="user"]')

    userMessages.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const textContent = htmlElement.innerText || htmlElement.textContent || ''

      messages.push({
        id: `chatgpt-msg-${index}`,
        text: textContent,
        title: extractKeywords(textContent),
        element: htmlElement,
        timestamp: Date.now()
      })
    })

    console.log('[ChatGPT Parser] 找到用户消息数:', messages.length)
    return messages
  }

  observeChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      // 检查是否有新消息添加
      const hasNewMessage = mutations.some(mutation =>
        Array.from(mutation.addedNodes).some(node => {
          if (node instanceof HTMLElement) {
            return node.querySelector('[data-message-author-role="user"]') !== null ||
                   node.hasAttribute('data-message-author-role')
          }
          return false
        })
      )

      if (hasNewMessage) {
        console.log('[ChatGPT Parser] 检测到新消息')
        callback()
      }
    })

    // 观察整个对话容器
    const container = document.querySelector('main') || document.body
    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return observer
  }
}

/**
 * Gemini 解析器
 */
class GeminiParser implements PlatformParser {
  getUserMessages(): MessageItem[] {
    const messages: MessageItem[] = []

    // Gemini 使用特定的 class 标识用户消息
    // 可能的选择器：.user-message, [data-test-id*="user"], message-content
    const possibleSelectors = [
      '.user-message',
      '[data-test-id*="user"]',
      '.message-content[data-author="user"]',
      'message-set.user-message'
    ]

    let userMessages: NodeListOf<Element> | null = null
    for (const selector of possibleSelectors) {
      userMessages = document.querySelectorAll(selector)
      if (userMessages.length > 0) {
        console.log('[Gemini Parser] 使用选择器:', selector)
        break
      }
    }

    if (!userMessages || userMessages.length === 0) {
      console.warn('[Gemini Parser] 未找到用户消息')
      return messages
    }

    userMessages.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const textContent = htmlElement.innerText || htmlElement.textContent || ''

      messages.push({
        id: `gemini-msg-${index}`,
        text: textContent,
        title: extractKeywords(textContent),
        element: htmlElement,
        timestamp: Date.now()
      })
    })

    console.log('[Gemini Parser] 找到用户消息数:', messages.length)
    return messages
  }

  observeChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver(() => {
      callback()
    })

    const container = document.querySelector('main') || document.body
    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return observer
  }
}

/**
 * 豆包解析器
 */
class DoubaoParser implements PlatformParser {
  getUserMessages(): MessageItem[] {
    const messages: MessageItem[] = []

    // 豆包用户消息的精确选择器
    // 方法1: 通过插件标识符区分用户消息和AI回复
    // 用户消息: Symbol(infra:send-message-box:text)
    // AI回复: Symbol(infra:receive-message-box:text)
    const possibleSelectors = [
      '[data-plugin-identifier*="send-message-box"]', // 豆包用户消息插件标识
      '[data-testid="message_content"].justify-end',  // 豆包用户消息容器（右对齐）
      '.message-item.user',                            // 旧版兼容
      '[data-role="user"]',                            // 旧版兼容
      '.chat-message-user',
      '.message-box.user'
    ]

    let userMessages: NodeListOf<Element> | null = null
    for (const selector of possibleSelectors) {
      userMessages = document.querySelectorAll(selector)
      if (userMessages.length > 0) {
        console.log('[Doubao Parser] 使用选择器:', selector)
        break
      }
    }

    if (!userMessages || userMessages.length === 0) {
      console.warn('[Doubao Parser] 未找到用户消息')
      return messages
    }

    userMessages.forEach((element, index) => {
      const htmlElement = element as HTMLElement

      // 获取消息文本内容
      const textElement = htmlElement.querySelector('[data-testid="message_text_content"]')
      const textContent = textElement?.textContent?.trim() || htmlElement.innerText?.trim() || ''

      // 跳过空消息
      if (!textContent) {
        return
      }

      messages.push({
        id: `doubao-msg-${index}`,
        text: textContent,
        title: extractKeywords(textContent),
        element: htmlElement.closest('[data-testid="message_content"]') as HTMLElement || htmlElement,
        timestamp: Date.now()
      })
    })

    console.log('[Doubao Parser] 找到用户消息数:', messages.length)
    return messages
  }

  observeChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver(() => {
      callback()
    })

    const container = document.querySelector('main') || document.querySelector('.chat-container') || document.body
    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return observer
  }
}

/**
 * 腾讯元宝消息解析器
 */
class YuanbaoParser implements PlatformParser {
  getUserMessages(): MessageItem[] {
    const messages: MessageItem[] = []

    // 腾讯元宝的用户消息选择器
    const selector = '.agent-chat__bubble--human'
    const userMessages = document.querySelectorAll(selector)

    if (userMessages.length === 0) {
      console.warn('[Yuanbao Parser] 未找到用户消息')
      return messages
    }

    // 使用Set去重，避免重复显示
    const seen = new Set<string>()

    userMessages.forEach((element) => {
      const htmlElement = element as HTMLElement

      // 获取文本内容
      const textElement = htmlElement.querySelector('.hyc-content-text')
      const textContent = textElement?.textContent?.trim() || htmlElement.innerText?.trim() || ''

      // 跳过空消息
      if (!textContent) {
        return
      }

      // 使用消息内容+元素位置作为唯一标识来去重
      const elementRect = htmlElement.getBoundingClientRect()
      const uniqueKey = `${textContent}-${elementRect.top}-${elementRect.left}`

      // 如果已经处理过相同的消息，跳过
      if (seen.has(uniqueKey)) {
        console.log('[Yuanbao Parser] 跳过重复消息:', textContent.substring(0, 30))
        return
      }

      seen.add(uniqueKey)

      messages.push({
        id: `yuanbao-msg-${messages.length}`,
        text: textContent,
        title: extractKeywords(textContent),
        element: htmlElement,
        timestamp: Date.now()
      })
    })

    console.log('[Yuanbao Parser] 找到用户消息数:', messages.length)
    return messages
  }

  observeChanges(callback: () => void): MutationObserver {
    const observer = new MutationObserver(() => {
      callback()
    })

    // 监听对话容器的变化
    const container = document.querySelector('.agent-chat__container')
                   || document.querySelector('main')
                   || document.body

    observer.observe(container, {
      childList: true,
      subtree: true
    })

    return observer
  }
}

/**
 * 获取平台对应的解析器
 */
export function getParser(platform: Platform): PlatformParser | null {
  switch (platform) {
    case Platform.CHATGPT:
      return new ChatGPTParser()
    case Platform.GEMINI:
      return new GeminiParser()
    case Platform.DOUBAO:
      return new DoubaoParser()
    case Platform.YUANBAO:
      return new YuanbaoParser()
    default:
      console.error('[Parser] 不支持的平台:', platform)
      return null
  }
}
