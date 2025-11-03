import { OutlineManager } from './outline'
import './styles.css'

console.log('[ChatOutline] 内容脚本已加载')

// 创建并初始化大纲管理器
const outlineManager = new OutlineManager()
outlineManager.init()

// 在页面卸载时清理
window.addEventListener('beforeunload', () => {
  outlineManager.destroy()
})
