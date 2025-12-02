import { OutlineManager } from './outline'
import './styles.css'
import './precision-navigator.css'

console.log('[ChatOutline] 内容脚本已加载')

// 创建并初始化大纲管理器
const outlineManager = new OutlineManager()
outlineManager.init()

// 添加键盘快捷键支持
let lastKeyPressTime = 0
const KEY_COMBO_TIMEOUT = 1000 // 1秒内完成组合键

document.addEventListener('keydown', (e) => {
  const currentTime = Date.now()

  // 双击 Ctrl + M 切换模式
  if (e.ctrlKey && e.key === 'm') {
    if (currentTime - lastKeyPressTime < KEY_COMBO_TIMEOUT) {
      e.preventDefault()
      outlineManager.toggleNavigationMode()
      console.log('[ChatOutline] 切换导航模式')
    }
    lastKeyPressTime = currentTime
  }
})

// 在页面卸载时清理
window.addEventListener('beforeunload', () => {
  outlineManager.destroy()
})
