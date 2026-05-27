# Hello LLM Core — React 聊天应用

> 基于 Vite + React + TypeScript 实现的 ChatGPT 经典风格聊天界面，前端直接调用 OpenAI 兼容 API 与大模型交互。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:5173/`。

### 3. 配置 API

点击左侧边栏底部「设置」按钮，在弹出的设置面板中填写：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **API Key** | OpenAI 兼容 API 密钥 | `sk-xxxxxxxx` |
| **Base URL** | API 服务地址 | `https://api.openai.com/v1` |
| **Model ID** | 模型标识 | `gpt-4o` / `deepseek-chat` |

配置自动保存到浏览器 localStorage，刷新不丢失。

### 4. 开始对话

点击「新建对话」，在底部输入框输入消息，按 Enter 发送。支持 Markdown 渲染、代码语法高亮、流式打字效果。

---

## 项目结构

```
hello-llm-core/
├── index.html                      # Vite 入口
├── package.json                    # 项目配置
├── vite.config.ts                  # Vite 构建配置
├── tailwind.config.js              # Tailwind CSS 配置
├── src/
│   ├── main.tsx                    # React 入口
│   ├── App.tsx                     # 根组件（双栏布局 + 响应式）
│   ├── index.css                   # Tailwind 全局样式
│   ├── types/
│   │   └── chat.ts                 # 类型定义（Conversation / Message / Settings）
│   ├── utils/
│   │   └── storage.ts              # localStorage 存储工具
│   ├── contexts/
│   │   ├── ChatContext.tsx          # 对话状态管理（useReducer）
│   │   └── ThemeContext.tsx         # 暗色/亮色主题切换
│   ├── hooks/
│   │   ├── useLLMClient.ts         # OpenAI 客户端实例管理 Hook
│   │   ├── useStreamChat.ts        # 流式对话核心 Hook
│   │   └── useLocalStorage.ts      # 通用 localStorage 持久化 Hook
│   ├── components/
│   │   ├── Sidebar.tsx             # 左侧面板（对话列表 + 设置）
│   │   ├── ChatArea.tsx            # 聊天主区域
│   │   ├── MessageList.tsx         # 消息列表容器
│   │   ├── MessageBubble.tsx       # 消息气泡（Markdown 渲染）
│   │   ├── ChatInput.tsx           # 底部输入框
│   │   ├── SettingsModal.tsx        # API 设置弹窗
│   │   └── CodeBlock.tsx           # 代码块（语法高亮 + 一键复制）
│   └── legacy/                     # 原 CLI 代码归档
│       ├── client.ts               # 原 HelloAgentsLLM 类
│       └── main.ts                 # 原 CLI 入口
```

## Hooks 学习对照

本项目从 Node.js CLI 改造为 React 前端，核心逻辑用 Hooks 重新实现：

| 原 CLI 代码 | React Hook | 核心职责 |
|---|---|---|
| `HelloAgentsLLM` 类（构造函数） | `useLLMClient` | 校验配置、创建 OpenAI 客户端实例 |
| `think(messages, temperature?)` | `useStreamChat.sendMessage()` | 流式调用 API、逐 chunk 追加响应文本 |
| `src/main.ts` CLI 入口 | `App.tsx` + `ChatArea.tsx` | ChatGPT 风格图形化交互界面 |

## 功能特性

- **OpenAI 经典风格** — 双栏布局，左侧对话列表，右侧聊天区域
- **流式输出** — 实时打字效果，追加显示大模型响应
- **Markdown 渲染** — 支持标题、列表、表格、代码块等
- **代码语法高亮** — 自动识别语言，高亮显示 + 一键复制
- **多轮对话** — 新建/切换/删除对话，消息历史持久化
- **暗色/亮色主题** — 一键切换，主题选择保存到 localStorage
- **API 配置管理** — 支持任意 OpenAI 兼容服务，配置持久化
- **响应式适配** — 移动端自动收起侧边栏

## 技术栈

| 技术 | 用途 |
|------|------|
| **Vite 5** | 构建工具 |
| **React 18** | UI 框架 |
| **TypeScript 5** | 类型安全 |
| **Tailwind CSS 3.4** | 样式方案 |
| **OpenAI SDK v4** | LLM API 调用（浏览器端） |
| **react-markdown** | Markdown 消息渲染 |
| **react-syntax-highlighter** | 代码块语法高亮 |
| **lucide-react** | 图标库 |
| **Context API + useReducer** | 状态管理 |

## 构建 & 部署

```bash
npm run build       # 生产构建
npm run preview     # 预览生产构建
```
