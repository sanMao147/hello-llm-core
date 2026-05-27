---
name: react-chat-ui-openai-style
overview: 将现有 Node.js CLI 项目改造为 Vite + React 前端学习项目，用 React hooks 重新实现 HelloAgentsLLM 客户端的核心逻辑（useLLMClient、useStreamChat），并构建 OpenAI ChatGPT 经典风格的聊天界面。API Key 在前端配置，直接调用 OpenAI SDK 流式响应。
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
    fontFamily: Söhne, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif
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
  - id: explore-archive
    content: 使用 [subagent:code-explorer] 探索现有项目配置，归档 CLI 代码至 src/legacy/
    status: completed
  - id: init-vite
    content: 项目转型：配置 Vite + React + TypeScript + Tailwind，重写 package.json 和 tsconfig.json
    status: completed
    dependencies:
      - explore-archive
  - id: define-types-and-storage
    content: 定义 chat 类型（Conversation/Message/Settings），实现 storage 工具和 useLocalStorage Hook
    status: completed
    dependencies:
      - init-vite
  - id: build-hooks
    content: 使用 [skill:react] 实现 useLLMClient 和 useStreamChat 两个核心 hooks，对标原 CLI 代码
    status: completed
    dependencies:
      - define-types-and-storage
  - id: build-contexts
    content: 使用 [skill:frontend-patterns] 实现 ChatContext 和 ThemeContext（useReducer + Provider）
    status: completed
    dependencies:
      - define-types-and-storage
  - id: build-layout-and-sidebar
    content: 实现 App 双栏布局 + Sidebar 组件（新建按钮、对话列表、删除确认、主题切换）
    status: completed
    dependencies:
      - build-contexts
  - id: build-chat-ui
    content: 实现 ChatArea、MessageList、MessageBubble（Markdown 渲染）、ChatInput 组件
    status: completed
    dependencies:
      - build-contexts
      - build-hooks
  - id: build-settings
    content: 实现 SettingsModal 设置弹窗（API Key/Base URL/Model 配置 + 持久化）
    status: completed
    dependencies:
      - build-chat-ui
  - id: polish
    content: 完善 CodeBlock 语法高亮、响应式适配、空状态引导、流式光标动画
    status: completed
    dependencies:
      - build-settings
      - build-layout-and-sidebar
---

## 产品概述

作为学习项目，核心目标是用 React hooks 重新实现现有 CLI 代码：将 `HelloAgentsLLM` 类重构为 `useLLMClient` + `useStreamChat` 两个自定义 hooks，并在此基础上构建 OpenAI ChatGPT 经典风格的聊天界面。原 CLI 代码归档至 `src/legacy/` 供学习对照，项目整体转型为 Vite + React 前端应用。

## 核心功能

- **Hooks 重写 CLI**（学习主线）：`HelloAgentsLLM` 构造逻辑 → `useLLMClient`；`think()` 流式方法 → `useStreamChat`
- **聊天对话管理**：左侧面板支持新建对话、切换历史对话、删除对话，持久化到 localStorage
- **流式消息对话**：右侧主聊天区发送消息、流式逐字渲染 AI 回复，支持 Markdown 格式
- **API 配置面板**：设置弹窗配置 API Key / Base URL / Model ID，持久化到 localStorage
- **暗色/亮色主题**：一键切换，主题偏好持久化
- **响应式布局**：移动端侧边栏折叠为浮层抽屉

## 技术栈

- **构建工具**：Vite 5 + React 18 + TypeScript 5
- **UI 样式**：Tailwind CSS 3.4 + tailwind-merge + tailwindcss-animate
- **AI 调用**：openai SDK v4（浏览器端直接调用）
- **Markdown 渲染**：react-markdown + remark-gfm + react-syntax-highlighter
- **图标**：lucide-react
- **状态管理**：React useReducer + Context API
- **持久化**：localStorage

## 实现方案

### 整体策略

**CLI 代码归档**：将现有 `src/client.ts` 和 `src/main.ts` 移至 `src/legacy/` 目录，保留供学习对照。

**项目转型**：根目录直接装配为 Vite + React 项目，`package.json` 重写为前端项目依赖，`tsconfig.json` 调整为 React 配置。

### Hooks 重写映射

| 原 CLI 代码 | React Hook | 职责 |
| --- | --- | --- |
| `HelloAgentsLLM` 构造函数 | `useLLMClient(settings)` | 校验/管理 OpenAI 客户端实例和配置 |
| `think(messages, temperature)` | `useStreamChat(options)` | 管理消息列表、发起流式调用、追踪 streaming 状态 |
| `src/main.ts` CLI 入口 | `App` 组件 | ChatGPT 风格 UI，编排所有 hooks |


### Hooks 设计详解

**`useLLMClient`** — 对标构造函数：

- 输入：`{ apiKey, baseUrl, model }` 从 Settings 读取
- 校验：任一为空时 `isConfigured` 为 false（`isConfigured: boolean`），派生的 `validationErrors` 在 UI 提示用户
- 客户端实例通过 `useMemo` 缓存，config 变更时惰性重建
- 输出：`{ client, config, isConfigured }`

**`useStreamChat`** — 对标 `think()`：

- `sendMessage(userContent, temperature?)`：自动构建 system prompt，发起 `client.chat.completions.create({ stream: true })`
- 流式消费：`for await (const chunk of stream)`，逐 chunk 追加到消息 content
- 状态：`messages` | `isStreaming` | `error`
- 性能：`requestAnimationFrame` 节流更新 React 状态，避免每个 chunk re-render

### 关键技术决策

**Tailwind CSS**：遵循 React 项目规范，dark class 实现主题切换，减少独立样式文件。

**useReducer + Context**：状态结构简洁，React 内置方案零额外依赖。ChatContext 管理对话 CRUD + 消息列表，ThemeContext 管理暗色/亮色。

### 目录结构

```
hello-llm-core/
├── src/
│   ├── legacy/                 # [MOVED] CLI 归档
│   │   ├── client.ts           # 原 HelloAgentsLLM
│   │   └── main.ts             # 原 CLI 入口
│   ├── main.tsx                # [NEW] React 入口
│   ├── App.tsx                 # [NEW] 根组件
│   ├── index.css               # [NEW] Tailwind + 全局样式
│   ├── contexts/
│   │   ├── ChatContext.tsx      # [NEW] 对话+消息状态
│   │   └── ThemeContext.tsx     # [NEW] 主题状态
│   ├── components/
│   │   ├── Sidebar.tsx          # [NEW] 左侧面板
│   │   ├── ChatArea.tsx         # [NEW] 右侧主区域
│   │   ├── MessageList.tsx      # [NEW] 消息列表
│   │   ├── MessageBubble.tsx    # [NEW] 消息气泡
│   │   ├── ChatInput.tsx        # [NEW] 输入框
│   │   ├── SettingsModal.tsx    # [NEW] 设置弹窗
│   │   └── CodeBlock.tsx        # [NEW] 代码块
│   ├── hooks/
│   │   ├── useLLMClient.ts      # [NEW] 对标构造逻辑
│   │   ├── useStreamChat.ts     # [NEW] 对标 think()
│   │   └── useLocalStorage.ts   # [NEW] 持久化
│   ├── types/
│   │   └── chat.ts              # [NEW] 类型定义
│   └── utils/
│       └── storage.ts           # [NEW] localStorage 工具
├── index.html                   # [NEW] Vite 入口
├── package.json                 # [MODIFY] 前端项目配置
├── vite.config.ts               # [NEW] Vite 配置
├── tailwind.config.js           # [NEW] Tailwind 配置
├── postcss.config.js            # [NEW] PostCSS 配置
└── tsconfig.json                # [MODIFY] React 项目 TS 配置
```

## 设计风格

完全参考 OpenAI ChatGPT 经典界面：左侧深色侧边栏 + 右侧聊天主区域双栏结构。干净克制，大量留白，轻微圆角，极简图标。

## 布局

- **左侧面板**（w-64，bg-[#171717]）：新建对话按钮 → 对话列表（可滚动）→ 底部设置入口 + 主题切换
- **右侧主区域**：顶部模型名称 + 中间消息列表（flex-1 overflow-y-auto）+ 底部固定输入框（sticky bottom-0 bg-white dark:bg-[#343541]）
- **设置弹窗**：居中 Modal，遮罩层点击 + Esc 关闭，含安全提示

## 交互

- 用户消息右对齐（浅蓝背景），AI 消息左对齐（灰色背景）+ Markdown 渲染
- 流式输出时 AI 气泡末尾闪烁光标，完成后消失
- Enter 发送、Shift+Enter 换行，空消息不发送
- 代码块深色背景 + 语法高亮 + 复制按钮
- 对话 hover 显示删除图标，点击确认删除
- 移动端：侧边栏变为浮层抽屉，顶部汉堡按钮控制显隐

## SubAgent

- **code-explorer**
- 用途：探索现有项目配置（package.json、tsconfig.json、依赖版本），确认 CLI 代码精确结构
- 预期结果：获取现有依赖版本和模块配置，确保迁移无误

## Skill

- **react**
- 用途：指导 React hooks 开发，确保 `useLLMClient` 和 `useStreamChat` 符合最佳实践
- 预期结果：hooks 签名清晰、依赖数组正确、闭包问题处理到位
- **frontend-patterns**
- 用途：指导 useReducer + Context 状态管理模式和组件拆分
- 预期结果：ChatContext 和 ThemeContext 职责清晰，re-render 范围精确