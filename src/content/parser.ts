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

    // 豆包可能的选择器
    const possibleSelectors = [
      '.message-item.user',
      '[data-role="user"]',
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
      const textContent = htmlElement.innerText || htmlElement.textContent || ''

      messages.push({
        id: `doubao-msg-${index}`,
        text: textContent,
        title: extractKeywords(textContent),
        element: htmlElement,
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
    default:
      console.error('[Parser] 不支持的平台:', platform)
      return null
  }
}
