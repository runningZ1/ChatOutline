import { MessageItem, getParser } from './parser'
import { Platform, detectPlatform, getPlatformName } from '../utils/platform-detector'

/**
 * 大纲管理器
 */
export class OutlineManager {
  private platform: Platform
  private messages: MessageItem[] = []
  private observer: MutationObserver | null = null
  private triggerZone: HTMLElement | null = null
  private outlinePanel: HTMLElement | null = null
  private isPinned: boolean = false
  private currentUrl: string = ''
  private urlCheckInterval: number | null = null
  private hideTimeout: number | null = null

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
      this.createTriggerZone()
      this.createOutlinePanel()
      this.startObserving()
      this.startUrlMonitoring()
      this.updateOutline()
    }, 1000)
  }

  /**
   * 创建触发区域
   */
  private createTriggerZone() {
    this.triggerZone = document.createElement('div')
    this.triggerZone.id = 'chat-outline-trigger'
    this.triggerZone.title = '显示对话大纲'

    // 鼠标进入触发区域时显示面板
    this.triggerZone.addEventListener('mouseenter', () => {
      this.showPanel()
    })

    document.body.appendChild(this.triggerZone)
    console.log('[OutlineManager] 触发区域已创建')
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
        <button class="pin-button" title="固定面板">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 17v5"></path>
            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
          </svg>
        </button>
      </div>
      <div class="outline-content">
        <p class="outline-loading">正在加载...</p>
      </div>
    `

    // 固定按钮点击事件
    const pinButton = this.outlinePanel.querySelector('.pin-button')
    pinButton?.addEventListener('click', () => {
      this.togglePin()
    })

    // 鼠标进入面板时保持显示
    this.outlinePanel.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout)
        this.hideTimeout = null
      }
    })

    // 鼠标离开面板时（如果未固定）延迟隐藏
    this.outlinePanel.addEventListener('mouseleave', () => {
      if (!this.isPinned) {
        this.scheduleHide()
      }
    })

    document.body.appendChild(this.outlinePanel)
    console.log('[OutlineManager] 大纲面板已创建')
  }

  /**
   * 切换固定状态
   */
  private togglePin() {
    this.isPinned = !this.isPinned

    const pinButton = this.outlinePanel?.querySelector('.pin-button')
    if (pinButton) {
      if (this.isPinned) {
        pinButton.classList.add('pinned')
        console.log('[OutlineManager] 面板已固定')
      } else {
        pinButton.classList.remove('pinned')
        console.log('[OutlineManager] 面板已取消固定')
      }
    }
  }

  /**
   * 计划隐藏面板
   */
  private scheduleHide() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
    }

    this.hideTimeout = window.setTimeout(() => {
      this.hidePanel()
    }, 300)
  }

  /**
   * 显示面板
   */
  private showPanel() {
    if (!this.outlinePanel) return

    // 清除隐藏计时器
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }

    this.outlinePanel.classList.remove('hidden')
    console.log('[OutlineManager] 面板已显示')
  }

  /**
   * 隐藏面板
   */
  private hidePanel() {
    if (!this.outlinePanel || this.isPinned) return

    this.outlinePanel.classList.add('hidden')
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
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
    }
    if (this.triggerZone) {
      this.triggerZone.remove()
    }
    if (this.outlinePanel) {
      this.outlinePanel.remove()
    }
    console.log('[OutlineManager] 已销毁')
  }
}
