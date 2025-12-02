/**
 * 测试精准导航模式
 * 在浏览器控制台中运行此脚本来测试新模式
 */

// 检查插件是否已加载
if (typeof window.outlineManager === 'undefined') {
  console.log('❌ 插件未加载，请确保插件已安装并刷新页面')
} else {
  console.log('✅ 插件已加载，开始测试精准导航模式')

  // 测试模式切换
  console.log('当前模式:', window.outlineManager.navigationMode)

  // 切换到精准导航模式
  window.outlineManager.setNavigationMode('precision')
  console.log('切换到精准导航模式')

  // 等待UI渲染
  setTimeout(() => {
    // 检查小地图是否存在
    const minimap = document.getElementById('precision-minimap')
    const scrollbar = document.getElementById('precision-scrollbar')

    if (minimap && scrollbar) {
      console.log('✅ 精准导航模式UI组件已创建')
      console.log('✅ 小地图:', minimap)
      console.log('✅ 滚动条:', scrollbar)
    } else {
      console.log('❌ UI组件未正确创建')
    }

    // 测试导航点
    const navDots = document.querySelectorAll('.nav-dot')
    console.log(`导航点数量: ${navDots.length}`)

    // 测试模式切换按钮
    const modeButton = document.querySelector('.mode-toggle-button')
    if (modeButton) {
      console.log('✅ 模式切换按钮存在')
      // 模拟点击切换回大纲模式
      modeButton.click()
      setTimeout(() => {
        console.log('当前模式:', window.outlineManager.navigationMode)
      }, 500)
    }

  }, 1000)
}

// 测试键盘快捷键
console.log('💡 提示：双击 Ctrl + M 可以切换导航模式')