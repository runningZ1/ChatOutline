# ChatOutline - AI对话大纲导航插件

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 为 ChatGPT、Gemini、豆包等AI聊天平台提供智能对话大纲导航功能

## ✨ 功能特性

- 🎯 **智能提取标题**：自动从用户提问中提取关键词作为标题
- 📝 **只显示用户提问**：大纲仅列出用户的问题，简洁清晰
- 🔘 **悬浮按钮展开**：通过悬浮按钮轻松触发大纲面板
- 🚀 **快速跳转**：点击大纲项快速定位到对应对话位置
- 🌓 **深色模式支持**：自动适配系统深色模式
- 🌐 **多平台支持**：完美支持 ChatGPT、Gemini、豆包
- 🎯 **精准导航模式**：提供可视化对话地图和拖拽导航功能

## 📦 安装方法

### 从源码安装

1. **克隆仓库并安装依赖**

```bash
cd ChatOutline
npm install
```

2. **构建插件**

```bash
npm run build
```

3. **加载到浏览器**

- 打开 Chrome/Edge 浏览器
- 进入 `chrome://extensions/` 或 `edge://extensions/`
- 开启右上角的「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择项目中的 `dist` 目录

## 🎮 使用方法

### 基础使用

1. **访问支持的AI聊天平台**
   - ChatGPT: https://chatgpt.com 或 https://chat.openai.com
   - Gemini: https://gemini.google.com
   - 豆包: https://www.doubao.com

2. **开始对话**
   - 正常使用AI聊天工具进行对话

3. **查看大纲**
   - 点击右下角的悬浮按钮（紫色渐变圆形按钮）
   - 大纲面板会在右侧弹出，显示所有用户提问

4. **快速跳转**
   - 点击大纲中的任意项
   - 页面会自动滚动到对应的对话位置
   - 目标消息会有高亮动画提示

### 精准导航模式

**精准导航模式**提供了一种更直观、可视化的对话导航体验：

1. **启用精准导航模式**
   - 点击大纲面板头部的模式切换按钮（🎯图标）
   - 或使用快捷键：双击 `Ctrl + M`

2. **使用小地图**
   - 右侧面板显示对话的缩略图（类似IDE的小地图）
   - 每个对话都有对应的可视化标记点
   - 代码块消息会以绿色方块标记

3. **拖拽导航**
   - 右侧滚动条有可拖拽的手柄
   - 拖拽手柄可快速定位到任意对话位置
   - 点击滚动条任意位置可直接跳转

4. **缩放功能**
   - 小地图支持放大/缩小（+/-按钮）
   - 缩小时只显示标记点，放大时显示完整标题

5. **智能交互**
   - 鼠标滚轮可在对话间精确切换
   - 当前活跃的对话会有高亮指示
   - 支持触摸设备的手势操作

## 🛠️ 开发指南

### 技术栈

- **语言**: TypeScript
- **构建工具**: Vite + CRXJS
- **浏览器API**: Chrome Extension Manifest V3

### 项目结构

```
ChatOutline/
├── src/
│   ├── content/              # 内容脚本
│   │   ├── index.ts          # 入口文件
│   │   ├── outline.ts        # 大纲管理器
│   │   ├── parser.ts         # DOM解析器
│   │   ├── precision-navigator.ts  # 精准导航模式
│   │   ├── styles.css        # 基础样式文件
│   │   └── precision-navigator.css  # 精准导航样式
│   └── utils/                # 工具函数
│       ├── keyword-extractor.ts   # 关键词提取
│       └── platform-detector.ts   # 平台检测
├── manifest.json             # 插件配置
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript配置
└── vite.config.ts            # Vite配置
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## ⌨️ 快捷键

- **双击 `Ctrl + M`**：快速切换导航模式（大纲模式 ↔ 精准导航模式）

## 🔧 自定义配置

### 修改悬浮按钮位置

编辑 `src/content/styles.css` 中的 `#chat-outline-button` 样式：

```css
#chat-outline-button {
  right: 20px;    /* 距离右侧距离 */
  bottom: 80px;   /* 距离底部距离 */
}
```

### 修改标题提取长度

编辑 `src/utils/keyword-extractor.ts` 中的 `extractKeywords` 函数：

```typescript
export function extractKeywords(text: string, maxLength: number = 30) {
  // 修改 maxLength 默认值
}
```

## 🐛 已知问题

1. **Gemini 和豆包的 DOM 选择器**：由于这些平台可能更新其页面结构，DOM 选择器可能需要调整
2. **动态加载内容**：某些平台使用虚拟滚动，可能导致早期消息无法检测

如果遇到问题，请查看浏览器控制台的日志输出（以 `[ChatOutline]` 开头）

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 感谢所有使用和反馈的用户
- 使用的开源库：Vite、CRXJS、TypeScript

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

**注意**：本插件仅作为浏览器辅助工具，不会收集、存储或传输任何用户数据。
