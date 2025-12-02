import { MessageItem } from './parser'

/**
 * 精准导航模式管理器
 * 提供类似IDE小地图的可視化对话导航体验
 */
export class PrecisionNavigator {
  private scrollbar: HTMLElement | null = null
  private scrollbarHandle: HTMLElement | null = null
  private navDots: HTMLElement[] = []
  private messages: MessageItem[] = []
  private isDragging: boolean = false
  private currentMessageIndex: number = 0
  private tooltip: HTMLElement | null = null

  constructor() {
    console.log('[PrecisionNavigator] 初始化精准导航模式')
  }

  /**
   * 初始化精准导航组件
   */
  init() {
    this.createScrollbar()
    this.bindEvents()
    // 添加body class来隐藏浏览器滚动条
    document.body.classList.add('precision-navigation-active')
  }

  /**
   * 创建滚动条组件
   */
  private createScrollbar() {
    this.scrollbar = document.createElement('div')
    this.scrollbar.id = 'precision-scrollbar'
    this.scrollbar.className = 'precision-scrollbar'

    this.scrollbar.innerHTML = `
      <div class="scrollbar-track">
        <div class="scrollbar-line"></div>
        <div class="scrollbar-handle" style="top: 0px; height: 80px;">
          <div class="scrollbar-handle-grip"></div>
        </div>
        <div class="scrollbar-dots-container"></div>
      </div>
    `

    this.scrollbarHandle = this.scrollbar.querySelector('.scrollbar-handle') as HTMLElement
    document.body.appendChild(this.scrollbar)
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents() {
    if (!this.scrollbarHandle) return

    // 拖拽事件
    this.scrollbarHandle.addEventListener('mousedown', this.startDragging.bind(this))
    document.addEventListener('mousemove', this.drag.bind(this))
    document.addEventListener('mouseup', this.stopDragging.bind(this))

    // 点击滚动条直接跳转
    this.scrollbar?.addEventListener('click', this.handleScrollbarClick.bind(this))

    // 滚轮事件
    document.addEventListener('wheel', this.handleWheel.bind(this))
  }

  /**
   * 开始拖拽
   */
  private startDragging(e: MouseEvent) {
    this.isDragging = true
    this.scrollbarHandle?.classList.add('dragging')
    e.preventDefault()
  }

  /**
   * 拖拽中
   */
  private drag(e: MouseEvent) {
    if (!this.isDragging || !this.scrollbar || !this.scrollbarHandle) return

    const track = this.scrollbar.querySelector('.scrollbar-track') as HTMLElement
    const trackRect = track.getBoundingClientRect()
    const handleHeight = this.scrollbarHandle.offsetHeight

    let newTop = e.clientY - trackRect.top - handleHeight / 2
    newTop = Math.max(0, Math.min(newTop, trackRect.height - handleHeight))

    this.scrollbarHandle.style.top = `${newTop}px`

    // 计算对应的消息索引
    const progress = newTop / (trackRect.height - handleHeight)
    const messageIndex = Math.floor(progress * this.messages.length)
    this.scrollToMessage(messageIndex)
  }

  /**
   * 停止拖拽
   */
  private stopDragging() {
    this.isDragging = false
    this.scrollbarHandle?.classList.remove('dragging')
  }

  /**
   * 处理滚动条点击
   */
  private handleScrollbarClick(e: MouseEvent) {
    if (e.target === this.scrollbarHandle) return // 避免手柄点击冲突

    const track = this.scrollbar?.querySelector('.scrollbar-track') as HTMLElement
    const trackRect = track.getBoundingClientRect()
    const clickY = e.clientY - trackRect.top

    const progress = clickY / trackRect.height
    const messageIndex = Math.floor(progress * this.messages.length)
    this.scrollToMessage(messageIndex)
    this.updateScrollHandle(messageIndex)
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(e: WheelEvent) {
    if (!this.messages.length) return

    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(this.currentMessageIndex + delta, this.messages.length - 1))

    if (newIndex !== this.currentMessageIndex) {
      this.currentMessageIndex = newIndex
      this.updateScrollHandle(this.currentMessageIndex)
      this.highlightNavDot(this.currentMessageIndex)
    }
  }

  /**
   * 更新导航点
   */
  updateNavigationDots(messages: MessageItem[]) {
    this.messages = messages
    const dotsContainer = this.scrollbar?.querySelector('.scrollbar-dots-container')
    if (!dotsContainer) return

    // 清空现有导航点
    dotsContainer.innerHTML = ''
    this.navDots = []

    // 创建新的导航点
    messages.forEach((message, index) => {
      const dot = document.createElement('div')
      dot.className = 'nav-dot'
      dot.setAttribute('data-message-id', message.id)
      dot.setAttribute('data-index', index.toString())

      // 根据消息类型设置不同的样式
      if (this.isCodeMessage(message.title)) {
        dot.classList.add('code-dot')
      }

      // 计算位置
      const position = (index / messages.length) * 100
      dot.style.top = `${position}%`

      // 点击事件
      dot.addEventListener('click', () => {
        this.scrollToMessage(index)
        this.updateScrollHandle(index)
      })

      // 鼠标悬浮显示提问原文
      dot.addEventListener('mouseenter', (e) => {
        this.showTooltip(e as MouseEvent, message.title)
      })

      dot.addEventListener('mouseleave', () => {
        this.hideTooltip()
      })

      dotsContainer.appendChild(dot)
      this.navDots.push(dot)
    })

    console.log('[PrecisionNavigator] 更新了导航点，数量:', this.navDots.length)
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

    // 高亮效果
    this.highlightMessage(message.element)
    this.currentMessageIndex = index
    this.highlightNavDot(index)

    console.log('[PrecisionNavigator] 滚动到消息:', index)
  }

  /**
   * 更新滚动条手柄位置
   */
  private updateScrollHandle(messageIndex: number) {
    if (!this.scrollbarHandle || !this.messages.length) return

    const progress = messageIndex / (this.messages.length - 1)
    const track = this.scrollbar?.querySelector('.scrollbar-track') as HTMLElement
    const trackHeight = track.offsetHeight
    const handleHeight = this.scrollbarHandle.offsetHeight

    const newTop = progress * (trackHeight - handleHeight)
    this.scrollbarHandle.style.top = `${newTop}px`
  }

  /**
   * 高亮导航点
   */
  private highlightNavDot(index: number) {
    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }

  /**
   * 高亮消息
   */
  private highlightMessage(element: HTMLElement) {
    element.classList.add('precision-highlight')
    setTimeout(() => {
      element.classList.remove('precision-highlight')
    }, 2000)
  }

  /**
   * 判断是否为代码消息
   */
  private isCodeMessage(title: string): boolean {
    return title.includes('[代码]') || /```|`/g.test(title)
  }

  /**
   * 显示提示框
   */
  private showTooltip(e: MouseEvent, text: string) {
    // 移除现有tooltip
    this.hideTooltip()

    // 创建新tooltip
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'precision-tooltip'
    this.tooltip.textContent = text

    document.body.appendChild(this.tooltip)

    // 定位tooltip
    const dotRect = (e.target as HTMLElement).getBoundingClientRect()
    this.tooltip.style.position = 'fixed'
    this.tooltip.style.left = `${dotRect.right + 10}px`
    this.tooltip.style.top = `${dotRect.top}px`
  }

  /**
   * 隐藏提示框
   */
  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove()
      this.tooltip = null
    }
  }

  /**
   * 销毁导航器
   */
  destroy() {
    this.scrollbar?.remove()
    this.hideTooltip()
    this.navDots = []
    // 移除body class恢复浏览器滚动条
    document.body.classList.remove('precision-navigation-active')
    console.log('[PrecisionNavigator] 已销毁')
  }
}