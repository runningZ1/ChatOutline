// Popup页面逻辑
console.log('[ChatOutline Popup] 初始化')

// DOM元素
const outlineModeRadio = document.querySelector('input[name="navigationMode"][value="outline"]') as HTMLInputElement
const precisionModeRadio = document.querySelector('input[name="navigationMode"][value="precision"]') as HTMLInputElement
const leftPositionRadio = document.querySelector('input[name="outlinePosition"][value="left"]') as HTMLInputElement
const rightPositionRadio = document.querySelector('input[name="outlinePosition"][value="right"]') as HTMLInputElement
const statusMessage = document.getElementById('statusMessage') as HTMLElement
const outlinePositionSection = document.querySelector('.outline-position-section') as HTMLElement

// 加载保存的设置
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['navigationMode', 'outlinePosition'])

    const navigationMode = result.navigationMode || 'outline'
    const outlinePosition = result.outlinePosition || 'right'

    // 设置导航模式
    if (navigationMode === 'outline') {
      outlineModeRadio.checked = true
      outlinePositionSection.style.display = 'block'
    } else {
      precisionModeRadio.checked = true
      outlinePositionSection.style.display = 'none'
    }

    // 设置大纲位置
    if (outlinePosition === 'left') {
      leftPositionRadio.checked = true
    } else {
      rightPositionRadio.checked = true
    }

    console.log('[ChatOutline Popup] 设置已加载:', { navigationMode, outlinePosition })
  } catch (error) {
    console.error('[ChatOutline Popup] 加载设置失败:', error)
  }
}

// 显示状态消息
function showStatus(message: string, type: 'success' | 'error') {
  statusMessage.textContent = message
  statusMessage.className = `status-message show ${type}`

  setTimeout(() => {
    statusMessage.classList.remove('show')
  }, 2000)
}

// 保存设置
async function saveSettings(navigationMode: string, outlinePosition?: string) {
  try {
    const settings: Record<string, string> = { navigationMode }
    if (outlinePosition) {
      settings.outlinePosition = outlinePosition
    }

    await chrome.storage.local.set(settings)

    // 通知content script更新设置
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'UPDATE_SETTINGS',
        settings
      })
    }

    showStatus('设置已保存 ✓', 'success')
    console.log('[ChatOutline Popup] 设置已保存:', settings)
  } catch (error) {
    console.error('[ChatOutline Popup] 保存设置失败:', error)
    showStatus('保存失败，请重试', 'error')
  }
}

// 监听导航模式变化
outlineModeRadio?.addEventListener('change', () => {
  if (outlineModeRadio.checked) {
    outlinePositionSection.style.display = 'block'
    const selectedPosition = leftPositionRadio.checked ? 'left' : 'right'
    saveSettings('outline', selectedPosition)
  }
})

precisionModeRadio?.addEventListener('change', () => {
  if (precisionModeRadio.checked) {
    outlinePositionSection.style.display = 'none'
    saveSettings('precision')
  }
})

// 监听位置变化
leftPositionRadio?.addEventListener('change', () => {
  if (leftPositionRadio.checked && outlineModeRadio.checked) {
    saveSettings('outline', 'left')
  }
})

rightPositionRadio?.addEventListener('change', () => {
  if (rightPositionRadio.checked && outlineModeRadio.checked) {
    saveSettings('outline', 'right')
  }
})

// 初始化
loadSettings()
