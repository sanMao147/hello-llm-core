---
name: react-chat-ui-openai-style
overview: 在项目中新增 Vite + React 前端，实现 OpenAI 经典风格的聊天界面，前端直接调用 OpenAI SDK 与大模型交互，API Key 通过 UI 输入/LocalStorage 管理。
design:
  architecture:
    framework: react
  styleKeywords:
    - ChatGPT Classic
    - Clean
    - Dark Sidebar
    - Minimalism
    - Professional
  fontSystem:
    fontFamily: Söhne, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, Helvetica Neue, Arial
    heading:
      size: 18px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#10A37F"
      - "#0D8C6D"
      - "#19C99C"
    background:
      - "#FFFFFF"
      - "#F7F7F8"
      - "#171717"
      - "#212121"
      - "#343541"
      - "#444654"
    text:
      - "#ECECF1"
      - "#343541"
      - "#8E8EA0"
    functional:
      - "#10A37F"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: explore-project
    content: 使用 [subagent:code-explorer] 探索现有项目配置，确认依赖版本和模块规范
    status: pending
  - id: init-vite-react
    content: 初始化 client/ 目录下的 Vite + React + TypeScript 项目，配置 vite.config.ts 和 tsconfig.json
    status: pending
    dependencies:
      - explore-project
  - id: define-types
    content: 定义聊天相关类型（Conversation、Message、Settings），实现 localStorage 工具函数和 useLocalStorage Hook
    status: pending
    dependencies:
      - init-vite-react
  - id: build-contexts
    content: 使用 [skill:react] 实现 ChatContext 和 ThemeContext 状态管理，包含 reducer 逻辑和 Provider 组件
    status: pending
    dependencies:
      - define-types
  - id: build-layout
    content: 使用 [skill:frontend-patterns] 实现 App 双栏布局、Sidebar 组件（新建按钮、对话列表、删除功能）和 ThemeContext 主题切换
    status: pending
    dependencies:
      - build-contexts
  - id: build-chat-area
    content: 实现 ChatArea 主区域：MessageList 消息列表容器、MessageBubble 气泡组件（含 react-markdown 渲染）、ChatInput 输入框组件
    status: pending
    dependencies:
      - build-contexts
  - id: build-stream-chat
    content: 实现 openaiService 浏览器端调用封装和 useStreamChat Hook，接入 OpenAI SDK 流式消息
    status: pending
    dependencies:
      - build-chat-area
  - id: build-settings
    content: 实现 SettingsModal 设置弹窗，支持配置 API Key、Base URL、Model ID 并持久化
    status: pending
    dependencies:
      - build-chat-area
  - id: responsive-polish
    content: 完善响应式适配（移动端侧边栏抽屉）、代码块语法高亮、空状态引导、加载动画和全局样式细节
    status: pending
    dependencies:
      - build-settings
      - build-layout
---

## 产品概述

在现有 hello-llm-core Node.js 项目中新增一个 React 前端应用，实现类似 OpenAI ChatGPT 经典风格的聊天界面。用户可在浏览器中直接配置 API Key、Base URL 和模型参数，发送消息并接收流式响应。现有 CLI 代码完全保留不动。

## 核心功能

- **聊天对话管理**：左侧面板支持新建对话、切换历史对话、删除对话，对话列表持久化到 localStorage
- **流式消息对话**：右侧主聊天区域支持发送消息、流式逐字渲染 AI 回复、消息支持 Markdown 格式
- **API 配置面板**：顶部设置入口可配置 API Key、Base URL、Model ID，配置持久化到 localStorage
- **暗色/亮色主题**：一键切换深色/浅色主题，主题偏好持久化
- **响应式布局**：移动端可折叠侧边栏，适配不同屏幕尺寸

## 技术栈

- **构建工具**：Vite 5 + React 18 + TypeScript 5
- **UI 样式**：Pure CSS with CSS Custom Properties（实现主题切换），无需额外 CSS 框架
- **AI 调用**：openai SDK v4（浏览器端直接调用，与现有 Node.js 项目共享同一 SDK）
- **Markdown 渲染**：react-markdown + remark-gfm + react-syntax-highlighter
- **状态管理**：React useReducer + Context API
- **持久化**：localStorage

## 实现方案

### 整体策略

在现有项目根目录下新建 `client/` 目录存放 Vite React 项目，与现有 Node.js CLI 代码（src/client.ts、src/main.ts）完全隔离。`package.json` 仅新增前端相关脚本，不影响现有 `npm start` 行为。前端复用项目已有的 `openai` SDK 依赖，浏览器端通过 importmap 或直接打包引用。

### 关键架构决策

**为什么选择纯 CSS + CSS Variables 而非 Tailwind？**
现有项目零前端依赖，纯 CSS 方案无需额外 PostCSS 配置，主题切换通过 CSS 变量实现最简洁。ChatGPT 经典布局结构清晰（左侧固定宽度 + 右侧弹性布局），纯 CSS Grid/Flexbox 足以胜任。

**为什么使用 useReducer + Context 而非 Zustand？**
演示项目状态结构简单（对话列表、消息列表、设置项），React 内置方案零额外依赖且学习成本低。Context 按职责拆分为 ChatContext 和 ThemeContext，避免不必要重渲染。

**流式响应的实现方式**
前端直接调用 openai SDK 的 `chat.completions.create({ stream: true })`，返回 AsyncIterable。在 React 中通过 `useEffect` + 异步迭代器逐步更新消息内容，每次 chunk 追加到消息尾部实现逐字效果。

### 性能考量

- **流式渲染节流**：使用 `requestAnimationFrame` 批量更新 UI，避免每个 chunk 触发一次 re-render
- **对话列表虚拟化**：当前无需虚拟化（对话数量有限），后续扩展可接入 react-virtuoso
- **Markdown 渲染优化**：消息内容仅变更时重新渲染，使用 React.memo 包裹消息气泡组件

### 目录结构

```
hello-llm-core/
├── src/                        # 保留现有 CLI 代码，不做修改
│   ├── client.ts
│   └── main.ts
├── client/                     # [NEW] Vite React 前端项目
│   ├── index.html
│   ├── package.json            # 前端专用（可选，或将脚本合并到根 package.json）
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx            # 入口，挂载 App
│       ├── App.tsx             # 根组件，布局容器
│       ├── App.css             # 全局样式 + CSS 变量
│       ├── contexts/
│       │   ├── ChatContext.tsx  # 对话和消息状态管理
│       │   └── ThemeContext.tsx # 主题状态管理
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── Sidebar.tsx         # 左侧面板容器
│       │   │   ├── Sidebar.css
│       │   │   ├── ConversationList.tsx # 对话列表
│       │   │   └── NewChatButton.tsx    # 新建对话按钮
│       │   ├── ChatArea/
│       │   │   ├── ChatArea.tsx         # 右侧聊天主区域
│       │   │   ├── ChatArea.css
│       │   │   ├── MessageList.tsx      # 消息列表容器
│       │   │   ├── MessageBubble.tsx    # 单条消息气泡（含 Markdown 渲染）
│       │   │   └── ChatInput.tsx        # 底部输入框
│       │   ├── Settings/
│       │   │   ├── SettingsModal.tsx    # 设置弹窗
│       │   │   └── SettingsModal.css
│       │   └── common/
│       │       ├── CodeBlock.tsx        # 代码块组件（语法高亮）
│       │       └── Avatar.tsx           # 用户/AI 头像
│       ├── hooks/
│       │   ├── useLocalStorage.ts  # localStorage 读写 Hook
│       │   └── useStreamChat.ts    # 流式聊天逻辑 Hook
│       ├── services/
│       │   └── openaiService.ts    # OpenAI SDK 调用封装（浏览器端）
│       ├── types/
│       │   └── chat.ts             # 对话和消息类型定义
│       └── utils/
│           └── storage.ts          # localStorage 工具函数
├── package.json                # [MODIFY] 新增前端脚本
└── .env                        # 不动
```

## 实现注意事项

### 流式消息处理

- OpenAI SDK 浏览器端流式调用方式与 Node.js 一致，返回 `Stream<ChatCompletionChunk>`
- 使用 `for await...of` 消费流并逐段追加到消息 content，注意处理 rate limit 和网络断开
- 在 `ChatContext` 中维护 `streamingMessageId` 标识当前正在流式输出的消息

### 持久化策略

- 对话列表 + 消息内容 + 设置项均存入 localStorage，key 命名使用 `hello-llm-{category}` 前缀
- API Key 明文存储在 localStorage，需在设置页面添加安全提示（演示模式警告）
- 每次消息更新后去抖 300ms 写入 storage，避免频繁序列化

### 与现有项目隔离

- 前端所有文件放入 `client/` 子目录，不修改 `src/` 下任何文件
- 根 `package.json` 只新增 `"client:dev"` 和 `"client:build"` 脚本
- 前端启动命令：`npm run client:dev`（底层执行 `vite --config client/vite.config.ts`）
- 现有的 `npm start` 和 `npm run dev` 行为不变

## 设计风格

完全参考 OpenAI ChatGPT 经典界面布局：左侧深色侧边栏 + 右侧聊天主区域的双栏结构。采用干净克制的设计语言，大量留白、轻微圆角、极简图标，避免视觉噪音。

## 整体布局

- **左侧面板**（宽度 260px，深色背景 #171717）：从上至下依次为「新建对话按钮」→「对话列表（可滚动）」→「底部用户信息/设置入口」。移动端默认隐藏，通过汉堡菜单展开。
- **右侧主区域**：顶部居中显示当前模型名称，中间消息列表区域（flex-grow，overflow-y: auto），底部固定输入框。
- **设置弹窗**：居中 Modal，包含 API Key 输入框、Base URL 输入框、Model ID 输入框、保存/取消按钮及演示模式安全提示。

## 交互细节

- 消息气泡：用户消息右侧对齐（浅蓝/浅紫底色），AI 消息左侧对齐（中性灰底色，Markdown 渲染）
- 流式输出时，AI 消息气泡末尾显示闪烁光标动画（blinking cursor），输出完成后消失
- 新建对话自动聚焦输入框，对话切换时滚动到消息列表底部
- 输入框支持 Enter 发送、Shift+Enter 换行，空消息不可发送
- 设置弹窗点击遮罩层关闭，Esc 键关闭
- 代码块使用深色背景（#1e1e1e）+ 语法高亮 + 一键复制按钮
- 对话删除需二次确认（hover 显示删除图标，点击弹出确认）
- 主题切换按钮位于左下角用户区域，平滑过渡动画

## 响应式

- 桌面端（>768px）：双栏布局，侧边栏常驻
- 移动端（<=768px）：侧边栏变为浮层抽屉，通过顶部汉堡按钮控制显隐

## Agent Extensions

### SubAgent

- **code-explorer**
- 用途：探索现有项目结构，确认根 package.json 和 tsconfig.json 的精确配置，规划前端项目如何无缝集成
- 预期结果：获取现有依赖版本、脚本配置、ESM 模块设置等关键信息，确保前端配置与现有项目兼容

### Skill

- **frontend-patterns**
- 用途：指导 React 组件架构设计、状态管理模式和性能优化最佳实践
- 预期结果：确保 useReducer + Context 组合使用正确，组件拆分合理，避免不必要的重渲染

- **react**
- 用途：指导 React 组件开发，确保组件编写符合 React 最佳实践
- 预期结果：组件结构清晰，Props 类型定义完整，事件处理规范，hooks 使用正确