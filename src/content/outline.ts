import { MessageItem, getParser } from './parser'
import { Platform, detectPlatform, getPlatformName } from '../utils/platform-detector'

/**
 * 大纲管理器
 */
export class OutlineManager {
  private platform: Platform
  private messages: MessageItem[] = []
  private observer: MutationObserver | null = null
  private floatingButton: HTMLElement | null = null
  private outlinePanel: HTMLElement | null = null
  private isVisible: boolean = false
  private currentUrl: string = ''
  private urlCheckInterval: number | null = null

  constructor() {
    this.platform = detectPlatform()
    this.currentUrl = window.location.href
    console.log('[OutlineManager] 检测到平台:', getPlatformName(this.platform))
  }

  /**
   * 初始化大纲管理器
   */
  init() {
    if (this.platform === Platform.UNKNOWN) {
      console.error('[OutlineManager] 未知平台,无法初始化')
      return
    }

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup())
    } else {
      this.setup()
    }
  }

  /**
   * 设置大纲功能
   */
  private setup() {
    console.log('[OutlineManager] 开始设置大纲功能')

    // 延迟一点时间，确保页面元素已加载
    setTimeout(() => {
      this.createFloatingButton()
      this.createOutlinePanel()
      this.startObserving()
      this.startUrlMonitoring()
      this.updateOutline()
    }, 1000)
  }

  /**
   * 创建悬浮按钮
   */
  private createFloatingButton() {
    this.floatingButton = document.createElement('div')
    this.floatingButton.id = 'chat-outline-button'
    this.floatingButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    `
    this.floatingButton.title = '显示对话大纲'

    this.floatingButton.addEventListener('click', () => {
      this.togglePanel()
    })

    document.body.appendChild(this.floatingButton)
    console.log('[OutlineManager] 悬浮按钮已创建')
  }

  /**
   * 创建大纲面板
   */
  private createOutlinePanel() {
    this.outlinePanel = document.createElement('div')
    this.outlinePanel.id = 'chat-outline-panel'
    this.outlinePanel.className = 'hidden'

    this.outlinePanel.innerHTML = `
      <div class="outline-header">
        <h3>对话大纲</h3>
        <button class="close-button" title="关闭">×</button>
      </div>
      <div class="outline-content">
        <p class="outline-loading">正在加载...</p>
      </div>
    `

    const closeButton = this.outlinePanel.querySelector('.close-button')
    closeButton?.addEventListener('click', () => {
      this.hidePanel()
    })

    document.body.appendChild(this.outlinePanel)
    console.log('[OutlineManager] 大纲面板已创建')
  }

  /**
   * 切换面板显示/隐藏
   */
  private togglePanel() {
    if (this.isVisible) {
      this.hidePanel()
    } else {
      this.showPanel()
    }
  }

  /**
   * 显示面板
   */
  private showPanel() {
    if (!this.outlinePanel) return

    this.outlinePanel.classList.remove('hidden')
    this.isVisible = true
    console.log('[OutlineManager] 面板已显示')
  }

  /**
   * 隐藏面板
   */
  private hidePanel() {
    if (!this.outlinePanel) return

    this.outlinePanel.classList.add('hidden')
    this.isVisible = false
    console.log('[OutlineManager] 面板已隐藏')
  }

  /**
   * 开始监听DOM变化
   */
  private startObserving() {
    const parser = getParser(this.platform)
    if (!parser) {
      console.error('[OutlineManager] 无法获取解析器')
      return
    }

    // 防抖处理，避免频繁更新
    let updateTimer: number | null = null
    this.observer = parser.observeChanges(() => {
      if (updateTimer) {
        clearTimeout(updateTimer)
      }
      updateTimer = window.setTimeout(() => {
        console.log('[OutlineManager] DOM变化，更新大纲')
        this.updateOutline()
      }, 500)
    })

    console.log('[OutlineManager] 开始监听DOM变化')
  }

  /**
   * 开始监听 URL 变化（用于检测对话切换）
   */
  private startUrlMonitoring() {
    // 使用定时器检测 URL 变化
    this.urlCheckInterval = window.setInterval(() => {
      const newUrl = window.location.href
      if (newUrl !== this.currentUrl) {
        console.log('[OutlineManager] 检测到 URL 变化:', newUrl)
        this.currentUrl = newUrl

        // URL 变化时，延迟更新大纲（等待新对话加载）
        setTimeout(() => {
          this.updateOutline()
        }, 800)
      }
    }, 500)

    console.log('[OutlineManager] 开始监听 URL 变化')
  }

  /**
   * 更新大纲内容
   */
  private updateOutline() {
    const parser = getParser(this.platform)
    if (!parser) return

    this.messages = parser.getUserMessages()
    console.log('[OutlineManager] 更新大纲，消息数:', this.messages.length)

    this.renderOutline()
  }

  /**
   * 渲染大纲列表
   */
  private renderOutline() {
    if (!this.outlinePanel) return

    const contentDiv = this.outlinePanel.querySelector('.outline-content')
    if (!contentDiv) return

    if (this.messages.length === 0) {
      contentDiv.innerHTML = '<p class="outline-empty">暂无对话消息</p>'
      return
    }

    const listHTML = this.messages.map((msg, index) => `
      <div class="outline-item" data-message-id="${msg.id}">
        <span class="outline-number">${index + 1}</span>
        <span class="outline-title">${this.escapeHtml(msg.title)}</span>
      </div>
    `).join('')

    contentDiv.innerHTML = `<div class="outline-list">${listHTML}</div>`

    // 绑定点击事件
    contentDiv.querySelectorAll('.outline-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.scrollToMessage(index)
      })
    })

    console.log('[OutlineManager] 大纲已渲染')
  }

  /**
   * 滚动到指定消息
   */
  private scrollToMessage(index: number) {
    const message = this.messages[index]
    if (!message) return

    message.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })

    // 添加高亮效果
    message.element.classList.add('outline-highlight')
    setTimeout(() => {
      message.element.classList.remove('outline-highlight')
    }, 2000)

    console.log('[OutlineManager] 跳转到消息:', index)
  }

  /**
   * HTML转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this.urlCheckInterval) {
      clearInterval(this.urlCheckInterval)
    }
    if (this.floatingButton) {
      this.floatingButton.remove()
    }
    if (this.outlinePanel) {
      this.outlinePanel.remove()
    }
    console.log('[OutlineManager] 已销毁')
  }
}
